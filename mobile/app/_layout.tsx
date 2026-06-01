import "@/global.css";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import "react-native-reanimated";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@/context/AuthContext";
import { Slot } from "expo-router";
import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { useColorScheme } from "@/hooks/useColorScheme";
import { APIErrorObject } from "@/utils/NotificationHandler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TenantProvider } from "@/context/TenantContext";
import { SocketProvider } from "@/context/SocketContext";
import { BalladUIProvider } from "@eduinteractive/balladui";
import Toast, { ErrorToast, InfoToast, SuccessToast } from "react-native-toast-message";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onError: (error) => {
			const errorObject = ((error as any).response as any)?.data as APIErrorObject;
			if (errorObject && errorObject.error) {
				console.log("[QueryClient] Mutation error: " + errorObject.error.message);
			} else {
				console.log(
					"[QueryClient] Mutation error: Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
				);
				console.error(error);
			}
		},
	}),
});

const RootLayout = () => {
	const scheme = useColorScheme();

	useEffect(() => {
		SplashScreen.hideAsync();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<BalladUIProvider>
					<ThemeProvider value={DefaultTheme}>
						<SessionProvider>
							<TenantProvider>
								<SocketProvider>
									<Slot />
									<Toast
										topOffset={70}
										config={{
											error: (props) => (
												<ErrorToast
													{...props}
													text2NumberOfLines={
														0
													}
												/>
											),
											success: (props) => (
												<SuccessToast
													{...props}
													text2NumberOfLines={
														0
													}
												/>
											),
											info: (props) => (
												<InfoToast
													{...props}
													text2NumberOfLines={
														0
													}
												/>
											),
										}}
									/>
								</SocketProvider>
							</TenantProvider>
						</SessionProvider>
					</ThemeProvider>
				</BalladUIProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
};

export default RootLayout;
