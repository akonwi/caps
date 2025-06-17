export interface Hat {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface AppState {
  hats: Hat[];
  lastSelectedIds: string[];
}

export interface HatAddedEvent {
  hat: Hat;
}

export interface HatUpdatedEvent {
  hat: Hat;
}
