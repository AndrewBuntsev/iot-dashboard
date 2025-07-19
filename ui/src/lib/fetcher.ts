export const fetcher = (url: string) => fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}${url}`)
    .then(res => res.json());