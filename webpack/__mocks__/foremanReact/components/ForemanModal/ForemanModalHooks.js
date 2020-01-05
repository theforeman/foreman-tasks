const modalOpen = true;
const setModalOpen = jest.fn();
const setModalClosed = jest.fn();

export const useForemanModal = () => ({
  modalOpen,
  setModalOpen,
  setModalClosed,
});
export default useForemanModal;
