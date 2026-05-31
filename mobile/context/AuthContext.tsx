import { AuthData, AuthDataWithTokens, checkAuth, exchangeDfnCode, login, logout, register, resetPassword, refresh } from "@/api/Auth";
import { onSignUpBody } from "@/components/features/auth/SignUpForm";
import { useStorageState } from "@/hooks/useStorageState";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { DfnLoginCancelledError, DFN_ERROR_MESSAGES, startDfnLogin } from "@/utils/dfnLogin";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useContext, createContext, type PropsWithChildren, useState, useEffect, useCallback } from "react";
import { eventEmitter } from "@/api/APIHandler";

const AuthContext = createContext<{
	signIn: (mail: string, password: string) => Promise<any>;
	signInWithUniversity: () => Promise<void>;
	completeUniversityLogin: (params: { code?: string; status?: string }) => Promise<boolean>;
	signOut: () => void;
	signUp: (body: onSignUpBody) => Promise<void>;
	forgetPassword: (mail: string) => Promise<void>;
	refresh: () => Promise<any>;
	authData?: AuthData | null;
	authToken?: string | null;
	isLoading: boolean;
}>({
	signIn: () => new Promise(() => null),
	signInWithUniversity: () => new Promise(() => null),
	completeUniversityLogin: async () => false,
	signOut: () => null,
	signUp: () => new Promise(() => null),
	forgetPassword: () => new Promise(() => null),
	refresh: () => new Promise(() => null),
	authData: null,
	isLoading: false,
});

// This hook can be used to access the user info.
export const useAuth = () => {
	const value = useContext(AuthContext);
	if (process.env.NODE_ENV !== "production") {
		if (!value) {
			throw new Error("useSession must be wrapped in a <SessionProvider />");
		}
	}

	return value;
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
	const [[_aLoading, authToken], setAuthToken] = useStorageState("authToken");
	const [[_rLoading, refreshToken], setRefreshToken] = useStorageState("refreshToken");
	const [authData, setAuthData] = useState<AuthData | null>(null);
    const [isLoggedOut, setIsLoggedOut] = useState(false);

	const authQuery = useQuery<AuthData, Error>({
		queryFn: checkAuth,
		queryKey: ["checkAuth", authToken, refreshToken],
        retry: (_, error) => {
            if (error instanceof Response) {
                return error.status === 401;
            }
            return false;
        },
	});

	const applyAuthSuccess = (data: AuthDataWithTokens) => {
		setAuthToken(data.authToken ?? null);
		setRefreshToken(data.refreshToken ?? null);
		setAuthData(data);
		authQuery.refetch();
		router.replace("/dashboard");
	};

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: applyAuthSuccess,
		onError: NotificationHandler.showAxiosError,
	});

	const dfnExchangeMutation = useMutation({
		mutationFn: exchangeDfnCode,
		onSuccess: applyAuthSuccess,
		onError: NotificationHandler.showAxiosError,
	});

	const registerMutation = useMutation({
		mutationFn: register,
		onSuccess: () => {
			NotificationHandler.showSuccess(
				"Du hast dich erfolgreich registriert! Du kannst dich jetzt anmelden"
			);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const logoutMutation = useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			setAuthToken(null);
			setRefreshToken(null);
			setAuthData(null);
            router.replace("/auth");
            setIsLoggedOut(true);
			setTimeout(() => {
                setIsLoggedOut(false);
			}, 1000);
		},
		onError: (err) => {
			setAuthToken(null);
			setRefreshToken(null);
			setAuthData(null);
			authQuery.refetch();
			router.replace("/auth");
		},
	});

	const forgetPasswordMutation = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			NotificationHandler.showSuccess(
				"Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts geschickt."
			);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const refreshMutation = useMutation({
		mutationFn: refresh,
		onSuccess: (data) => {
			setAuthToken((data as any).authToken);
			setRefreshToken((data as any).refreshToken);
			setAuthData(data as AuthData);
		},
		onError: NotificationHandler.showAxiosError,
	});

	// Handle unauthorized event
	useEffect(() => {
		const handleUnauthorized = async () => {
            authQuery.refetch();
		};

		eventEmitter.on('unauthorized', handleUnauthorized);

		return () => {
			eventEmitter.off('unauthorized', handleUnauthorized);
		};
	}, []);

	useEffect(() => {
		if (authQuery.data && !isLoggedOut) {
			setAuthToken((authQuery.data as any).authToken);
			setRefreshToken((authQuery.data as any).refreshToken);
			setAuthData(authQuery.data);
		}
	}, [authQuery.data]);

    useEffect(() => {
        if (!isLoggedOut) {
            authQuery.refetch();
        }
    }, [isLoggedOut]);

    useEffect(() => {
        if (authQuery.error) {
            const error = authQuery.error as any;
            if (error?.response?.status === 401) {
                setAuthToken(null);
                setRefreshToken(null);
                setAuthData(null);
                router.replace("/auth");
            }
        }
    }, [authQuery.error]);

	const completeUniversityLogin = useCallback(async (params: { code?: string; status?: string }) => {
		if (params.status) {
			const message =
				DFN_ERROR_MESSAGES[params.status] ?? "Die Hochschul-Anmeldung ist fehlgeschlagen.";
			NotificationHandler.showError(message);
			return false;
		}

		if (!params.code?.trim()) {
			NotificationHandler.showError("Die Hochschul-Anmeldung ist fehlgeschlagen.");
			return false;
		}

		try {
			await dfnExchangeMutation.mutateAsync({
				body: { code: params.code.trim() },
			});
			return true;
		} catch {
			return false;
		}
	}, [dfnExchangeMutation]);
        
	return (
		<AuthContext.Provider
			value={{
				signIn: (mail, password) =>
					loginMutation.mutateAsync({
						body: {
							mail,
							password,
						},
					}),
				signInWithUniversity: async () => {
					try {
						const result = await startDfnLogin();
						if (result.type === "error") {
							await completeUniversityLogin({ status: result.status });
							return;
						}
						await completeUniversityLogin({ code: result.code });
					} catch (error) {
						if (error instanceof DfnLoginCancelledError) {
							return;
						}
						NotificationHandler.showError(
							error instanceof Error
								? error.message
								: "Die Hochschul-Anmeldung ist fehlgeschlagen."
						);
					}
				},
				completeUniversityLogin,
				signOut: () => {
					logoutMutation.mutateAsync();
				},
				signUp: (body) =>
					registerMutation.mutateAsync({
						body: {
							mail: body.mail,
							password: body.password,
							contact: {
								first_name: body.contact.first_name,
								last_name: body.contact.last_name,
								phone: body.contact.phone,
							},
						},
					}),
				forgetPassword: (mail) =>
					forgetPasswordMutation.mutateAsync({
						body: {
							mail,
						},
					}),
				refresh: () => refreshMutation.mutateAsync(),
				authData,
				isLoading: authQuery.isLoading,
				authToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
