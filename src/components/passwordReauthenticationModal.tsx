import { Button, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { useForm } from "react-hook-form";


export default function PasswordReauthenticationModal(props: { doAction: (p: string) => void, onClose: () => void }) {

    const { register, handleSubmit } = useForm<{ password: string }>();

    return (
        <Modal show onClose={props.onClose}>
            <ModalHeader>Mit ihrem Password besätigen</ModalHeader>
            <form onSubmit={handleSubmit((d) => { props.onClose(); props.doAction(d.password) })}>
                <ModalBody>
                    <div>
                        Sie versuchen eine geschützte Aktion auszuführen.
                        Bitte geben Sie zur besseren Sicherheit ihr Passwort erneut ein.
                    </div>
                    <FormLabel htmlFor="password">Ihr eigenes Password</FormLabel>
                    <FormControl
                        type="password"
                        autoComplete="off"
                        autoCorrect="off"
                        {...register('password', { required: true })} />


                </ModalBody>
                <ModalFooter>
                    <Button type="submit">Weiter</Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}