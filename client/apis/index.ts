import axios from 'axios';

export const generateThumbnail = async ({ category, customCategory, platform, image, focus, style, addons }) => {
    try {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("customCategory", customCategory);
        formData.append("platform", platform);
        formData.append("focus", focus);
        formData.append("style", style);
        formData.append("addons", addons);
        if (image) {
            formData.append("image", image);
        }

        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/generateThumbnail`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    } catch (error) {
        console.error("Error in generateThumbnail request: ", error);
        throw error.response.data;
    }
};

export const signinRequest = async ({ username, password }) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signin`, { username, password });
        return response;
    } catch (error) {
        console.log("Error in sigin request: ", error);
        throw error;
    }
}