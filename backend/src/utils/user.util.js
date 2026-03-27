/**
 * 👤 GENERATE DEFAULT AVATAR URL
 * "Bansal Sangani" -> BS, "Bansal" -> B
 */
export const generateAvatar = (name) => {
    if (!name) return `https://ui-avatars.com/api/?name=?&background=f8faff&color=4f46e5&bold=true&size=128`;

    const names = name.split(' ').filter(n => n);
    let initials = "";
    if (names.length >= 2) {
        initials = names[0].charAt(0) + names[names.length - 1].charAt(0);
    } else if (names.length === 1) {
        initials = names[0].charAt(0);
    } else {
        initials = "?";
    }

    // High-quality UI Avatar with Indigo/Blue theme matching the UI
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f8faff&color=4f46e5&bold=true&size=128`;
};
