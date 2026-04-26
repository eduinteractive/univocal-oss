import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/ForbiddenError";

export const isK8s = (req: Request, res: Response, next: NextFunction) => {
    const K8sNetworkKey = req.get('x-k8s');
    if (K8sNetworkKey) {
        if (K8sNetworkKey === process.env.NETWORK_KEY) {
            next();
        } else {
            throw new ForbiddenError("Invalid network key");
        }
    } else {
        throw new ForbiddenError("This route is only accessible from within the cluster");
    }
}