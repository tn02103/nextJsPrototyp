import { generate } from "generate-password";
import { Button, FormCheck, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { useForm } from "react-hook-form";


export default function ResetPasswordModal(props: {
    header: string;
    message: string;
    onClose: () => void;
    doAction: (password: string, sendMail: boolean) => void;
}) {

    const { register, handleSubmit } = useForm<{ sendMail: boolean }>();
    const newPassword = generate({ length: 12, numbers: true, strict: true });

    function onSubmit(data: { sendMail: boolean }) {
        props.onClose();
        props.doAction(newPassword, data.sendMail);
    }

    return (
        <Modal show onClose={props.onClose}>
            <ModalHeader closeButton>{props.header}</ModalHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody>
                    <p>
                        {props.message}
                    </p>
                    <p>
                        Neues Passwort: {newPassword}
                    </p>
                    <FormLabel htmlFor="password">Password per Mail an Nutzer senden?</FormLabel>
                    <FormCheck
                        type="switch"
                        {...register('sendMail')}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={props.onClose} variant="secondary">Abbrechen</Button>
                    <Button type="submit">Weiter</Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}
