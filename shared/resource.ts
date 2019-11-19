
export interface ResourceEditModel {
  link: string;
  description: string;
  category: string;
  tags: string[];
}

export interface ResourceModel {
  link: string;
  description: string;
  category: string;
  tags: string[];
  timestamp: Date;
  author?: string;
  channel?: string;
}
