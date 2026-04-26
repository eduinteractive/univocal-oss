import { BadRequestError } from "@eduinteractive/uvc-common";
import mongoose, { Model } from "mongoose";

export const validateLinkedList = async (model: Model<any>, condition: { [key: string]: any }, session: mongoose.ClientSession) => {
    try {
        const orphanDocuments = await model.find({
            ...condition,
            previous: { $exists: false },
            next: { $exists: false },
            _id: { $ne: (await model.findOne({ ...condition, previous: { $exists: false } }).session(session))?._id } // Erlaubt das erste Element
        }).session(session);

        if (orphanDocuments.length > 0) {
            throw new Error(`Fehler: Es existieren isolierte Dokumente (Datenleichen), die nicht zur Liste gehören.`);
        }

        const totalDocuments = await model.countDocuments({ ...condition }).session(session);
        if (totalDocuments === 0) {
            return;
        }

        let currentComponent = await model.findOne({ ...condition, previous: { $exists: false } }).session(session);

        if (!currentComponent) {
            throw new Error("Fehler: Die Liste konnte nicht validiert werden.");
        }

        let count = 0;
        let visited = new Set();

        while (currentComponent) {
            count++;
            visited.add(currentComponent._id.toString());

            if (currentComponent.next) {
                const nextComponent = await model.findOne({ _id: currentComponent.next, ...condition }).session(session);

                if (!nextComponent) {
                    throw new Error(`Fehler: Die Liste konnte nicht validiert werden.`);
                }

                if (nextComponent.previous.toString() !== currentComponent._id.toString()) {
                    throw new Error(`Fehler: Die Liste konnte nicht validiert werden.`);
                }

                currentComponent = nextComponent;
            } else {
                break;
            }
        }

        // Überprüfen, ob alle Komponenten durchlaufen wurden
        const totalComponents = await model.countDocuments({ ...condition }).session(session);
        if (count !== totalComponents) {
            throw new Error(`Fehler: Die Liste konnte nicht validiert werden.`);
        }
    } catch (err) {
        console.log(err);
        throw new BadRequestError('Fehler: Die Liste konnte nicht validiert werden.');
    }
}