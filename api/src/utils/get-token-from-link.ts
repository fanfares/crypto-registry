export const getTokenFromLink = (link: string) => new URL(link).searchParams.get('token');
