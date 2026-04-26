import { AxiosError } from "axios";
import React from "react";
import Toast from "react-native-toast-message";

export interface APIErrorObject {
	error: {
		name: string;
		message: string;
		statusCode: number;
		operational: boolean;
	};
}

export class NotificationHandler {

	public static showAxiosError(error: AxiosError) {
		const errorObject = error.response?.data as APIErrorObject;
		if (errorObject && errorObject.error) {
			NotificationHandler.showToast("Fehler", errorObject.error.message, "error");
		} else {
			NotificationHandler.showToast(
				"Fehler",
				"Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
				"error"
			);
		}
	}

	public static showError(message: string) {
		NotificationHandler.showToast("Fehler", message, "error");
	}

	public static showWarning(message: string) {
		NotificationHandler.showToast("Warnung", message, "info");
	}

	public static showInfo(message: string) {
		NotificationHandler.showToast("Info", message, "info");
	}

	public static showSuccess(message: string) {
		NotificationHandler.showToast("Erfolg", message, "success");
	}

	public static update(notification: string, message: string) {
		NotificationHandler.showToast(notification, message, "info");
	}

	public static showToast(
		title: string,
		message: string,
		variant: "success" | "error" | "info"
	) {

		Toast.show({
			type: variant,
			text1: title,
			text2: message,
		});
	}
}
