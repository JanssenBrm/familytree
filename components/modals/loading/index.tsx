import {Modal, ModalBody, ModalContent} from "@nextui-org/modal";
import {Spinner} from "@nextui-org/react";

const LoadingModal = () => {

    return (
        <Modal isOpen={true} backdrop="blur" hideCloseButton={true}>
            <ModalContent className="w-72 h-60">
                {(onClose) => (
                    <ModalBody className="flex flex-col justify-center items-center">
                        <Spinner size={"lg"} className="mb-5"/>
                        <span className="text-default-500 text-center font-bold">Even wachten!</span>
                        <span className="text-default-500 text-center text-tiny uppercase -mt-2">We laden uw familie in</span>
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    )
}

export default LoadingModal