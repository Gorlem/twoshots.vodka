export default function createSocketPlugin(socket) {
  return (store) => {
    socket.onAny((event, ...args) => {
      store.commit(`SOCKET_${event.toUpperCase()}`, args);
    });
  };
}
