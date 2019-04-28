// TODO: fix this fuckery, what is it even supposed to do

function checkStatus(response: Response): Promise<any> {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    const error = new Error(response.statusText);
    (error as any).response = response;
    return (
        response
            .json()
            .then((body) => {
                (error as any).body = body;
            })
            .catch(() => {
                // Catch body parsing errors and continue
            })
            .then(() => {
                throw error;
            })
    );
}

export default function fetchJSON(
    url: string,
    opts: Partial<RequestInit> = {},
): Promise<any> {
    return fetch(url, {credentials: 'same-origin', ...opts})
        .then(checkStatus)
        .then((response) => response.json());
}
