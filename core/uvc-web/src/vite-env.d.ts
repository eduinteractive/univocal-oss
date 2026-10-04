/// <reference types="vite/client" />

import { ERROR_HANDLING } from "./middleware/ErrorHandler"

interface ImportMetaEnv {
    VITE_KUBERNETES_HOST: string
    VITE_ERROR_HANDLING: ERROR_HANDLING
    VITE_PROFILE_BASE_DOMAIN?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
