import { state } from "./state.js";

export async function loadData() {
    const response = await fetch('./public/data/ecoles.json');

    if (!response.ok) {
        throw new Error(`HTTP error! status : ${response.status}`);
    }

    state.data = await response.json();
};