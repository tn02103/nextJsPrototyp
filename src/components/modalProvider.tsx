"use client"

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import PasswordReauthenticationModal from "./passwordReauthenticationModal";
import ResetPasswordModal from "./resetPasswordModal";

type ModalCapsule = {
    modalType: ModalTypes,
    props: any,
}

type ModalContextType = {
    passwordReauthenticationModal: (doAction: (p: string) => void) => void;
    resetPasswordModal: (header: string, message: string, doAction: (p: string, m: boolean) => void) => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);
export const useModal = () => useContext(ModalContext);


type ModalTypes = "passwordReauthentication" | "resetPasswordModal"

const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [queue, setQueue] = useState<ModalCapsule[]>([]);


    const passwordReauthenticationModal = useCallback((doAction: (p: string) => void) => {
        const modal = {
            modalType: "passwordReauthentication",
            props: { doAction }
        } satisfies ModalCapsule
        setQueue((prevState) => [...prevState, modal]);
    }, []);

    const resetPasswordModal = useCallback((header: string, message: string, doAction: (p: string, m: boolean) => void) => {
        const modal = {
            modalType: "resetPasswordModal",
            props: { header, message, doAction, }
        } satisfies ModalCapsule;

        setQueue((prevState) => [...prevState, modal]);

    }, []);

    const getModalContext = useCallback(() => {
        return {
            passwordReauthenticationModal,
            resetPasswordModal,
        }
    }, [
        passwordReauthenticationModal,
        resetPasswordModal,
    ]);
    const onClose = () => {
        setQueue(prevState => prevState.slice(1))
    }
    function renderModal(modal: ModalCapsule) {
        switch (modal.modalType) {
            case "passwordReauthentication":
                return <PasswordReauthenticationModal {...modal.props} onClose={onClose} />;
            case "resetPasswordModal":
                return <ResetPasswordModal {...modal.props} onClose={onClose} />;
        }
    }
    return (
        <ModalContext.Provider value={getModalContext()}>
            {queue[0] && renderModal(queue[0])}
            {children}
        </ModalContext.Provider>
    )
}

export default ModalProvider;