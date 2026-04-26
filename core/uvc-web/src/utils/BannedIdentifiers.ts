export const bannedIdentifiers = [
    'SS',
    '88',
];

export const getValidAvatarIdentifier = (firstName?: string, lastName?: string) => {
    let isValid = true
    if (!firstName || !lastName) return 'XX';
    bannedIdentifiers.forEach((bannedIdentifier) => {
        if (firstName[0] + lastName[0] === bannedIdentifier) {
            isValid = false;
        }
    });
    if (!isValid) return `${firstName.substring(0,2)}${lastName.substring(0,1)}`;
    return `${firstName[0]}${lastName[0]}`;
}