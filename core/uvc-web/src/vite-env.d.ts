/// <reference types="vite/client" />

import { ERROR_HANDLING } from "./middleware/ErrorHandler"

interface ImportMetaEnv {
    VITE_KUBERNETES_HOST: string
    VITE_ERROR_HANDLING: ERROR_HANDLING
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
