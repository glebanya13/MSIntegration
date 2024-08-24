const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6TDirBGr8Qf2uGXcNcAhrDlRH2jGZPsBYY7Yi8-HTzdMSXp_dooGpfnGjANv77N4Qbw/exec';

export const upload = async (data) => {
    try {
        await fetch(WEB_APP_URL, {
            redirect: "follow",
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        });
    } catch (error) {
        console.error('Error uploading data:', error);
        throw error;
    }
};
