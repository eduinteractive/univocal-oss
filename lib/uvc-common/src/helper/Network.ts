import axios from "axios";

export const NetworkAxios = axios.create({
    headers: {
        'x-k8s': process.env.NETWORK_KEY
    }
})