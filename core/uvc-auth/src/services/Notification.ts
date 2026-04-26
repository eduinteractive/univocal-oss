import Expo, { ExpoPushErrorReceipt, ExpoPushReceipt, ExpoPushTicket } from "expo-server-sdk";
import UserAccount from "../models/UserAccount";

export const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
})

export let EXPO_TICKETS: ExpoPushTicket[] = [];

const handleNotificationTickets = async () => {
    try {
        console.log("[SERVER-INFORMATION] Handling notification tickets...");
        const receiptIds = [];
        for (const ticket of EXPO_TICKETS) {
            if (ticket.status === 'ok') {
                receiptIds.push(ticket.id);
            }
        }
        if (receiptIds.length === 0) {
            console.log("[SERVER-INFORMATION] No notification tickets to handle");
            return;
        }
        const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        for (const chunk of receiptChunks) {
            try {
                const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                for (const receiptId in receipts) {
                    let { status } = receipts[receiptId] as ExpoPushReceipt;
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        let { details } = receipts[receiptId] as ExpoPushErrorReceipt;
                        if (details && details.error) {
                            console.log(`[SERVER-INFORMATION] Error sending notification to ${details.expoPushToken}: ${details.error}`);
                            if (details.error === "DeviceNotRegistered") {
                                let pushToken = details.expoPushToken?.replace("ExponentPushToken[", "").replace("]", "");
                                const user = await UserAccount.findOne({ devices: { $elemMatch: { pushToken: pushToken } } });
                                if (user) {
                                    user.devices = user.devices.filter((device) => device.pushToken !== pushToken);
                                    await user.save();
                                }
                                console.log(`[SERVER-INFORMATION] User ${user?._id} has been updated`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        console.log("[SERVER-INFORMATION] Notification tickets handled");
        EXPO_TICKETS = [];
    } catch (error) {
        console.log(error);
    }
}

setInterval(() => handleNotificationTickets, 1000);

