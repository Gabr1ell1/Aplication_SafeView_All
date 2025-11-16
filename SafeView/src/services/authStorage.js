import * as SecureStore from "expo-secure-store";
// ----------------------
//  FUNÇÕES DE ARMAZENAMENTO
// ----------------------

export async function saveUser(data) {
  await SecureStore.setItemAsync("user", JSON.stringify(data));
}

export async function getUser() {
  const user = await SecureStore.getItemAsync("user");
  return user ? JSON.parse(user) : null;
}

export async function logoutUser() {
  await SecureStore.deleteItemAsync("user");
}

