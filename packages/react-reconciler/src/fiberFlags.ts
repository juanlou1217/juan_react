export type Flags = number;

export const NoFlags = 0b0000000000000;
export const Placement = 0b0000000000010;
export const Updatate = 0b0000000000100;
export const Deletion = 0b0000000001000;
export const ChildDeletion = 0b0000000010000;
