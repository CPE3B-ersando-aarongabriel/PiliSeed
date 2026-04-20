"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getClientAuth } from "@/lib/firebaseClient";

type PrivateRouteGuardProps = {
	children: ReactNode;
};

export default function PrivateRouteGuard({ children }: PrivateRouteGuardProps) {
	const router = useRouter();
	const [isReady, setIsReady] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const auth = getClientAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setIsAuthenticated(Boolean(user));
			setIsReady(true);

			if (!user) {
				router.replace("/login");
			}
		});

		return () => unsubscribe();
	}, [router]);

	if (!isReady || !isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#EFF6E7]">
				<p className="text-sm font-semibold text-[#00450D]">
					Checking your session...
				</p>
			</div>
		);
	}

	return <>{children}</>;
}
