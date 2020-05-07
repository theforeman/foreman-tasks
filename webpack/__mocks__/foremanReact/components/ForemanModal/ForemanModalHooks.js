const modalOpen = true;
const setModalOpen = jest.fn();
const setModalClosed = jest.fn();

export const useForemanModal = jest.fn(() => ({
  modalOpen,
  setModalOpen,
  setModalClosed,
}));
export default useForemanModal;
