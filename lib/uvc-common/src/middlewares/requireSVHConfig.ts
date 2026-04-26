import bodyParser from 'body-parser';
import { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import slowDown from 'express-slow-down';

export enum REQ_CLIENT {
    WEB = "WEB",
    MOBILE = "MOBILE",
}

declare global {
    namespace Express {
        interface Request {
            client?: REQ_CLIENT;
        }
    }
}

export interface SVHExpressConfig {
    S3Support?: boolean;
}

export const requireSVHConfig = (app: Express, config?: SVHExpressConfig) => {
    // Trust the first proxy (e.g., Ingress/Nginx) so rate limiters and req.ip work correctly
    app.set('trust proxy', 1);
    const limiter = slowDown({
        windowMs: 1 * 60 * 1000,
        delayAfter: 30,
        delayMs: (hits) => hits * 100,
    })
    app.use(limiter);
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors({
        origin: process.env.PUBLIC_URL,
        credentials: true,
        preflightContinue: true,
    }));
    app.use(cookieParser());
    if (config?.S3Support) {
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    }
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", process.env.PUBLIC_URL);
        res.header("Access-Control-Allow-Origin", "https://univocal.de");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-client, x-refresh-token, x-k8s");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        if (req.headers["x-client"] === "uvc-mobile") {
            req.client = REQ_CLIENT.MOBILE;
        } else {
            req.client = REQ_CLIENT.WEB;
        }
        next();
    });
    // Global OPTIONS Handler - aktiviere CORS für alle Pfade
    app.options("/{*splat}", cors());
}