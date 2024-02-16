import { Audience, ScriptData, Topic, Visual, Voiceover } from "./mockData/data";
import { getProjectStore } from "./store";

export function getProjectTopic(): Topic {
  if (!getProjectStore().has("topic")) {
    throw new Error("Topic not set");
  }
  return getProjectStore().get("topic") as Topic;
}

export function getProjectAudience(): Audience {
  if (!getProjectStore().has("audience")) {
    throw new Error("Audience not set");
  }
  return getProjectStore().get("audience") as Audience;
}

export function getProjectHasAvatar(): boolean {
  if (!getProjectStore().has("avatar")) {
    throw new Error("avatar not set");
  }
  return getProjectStore().get("avatar") as boolean;
}
export function getProjectHasSubtitles(): boolean {
  if (!getProjectStore().has("subtitles")) {
    throw new Error("subtitles not set");
  }
  return getProjectStore().get("subtitles") as boolean;
}

export function getProjectVoiceover(): Voiceover {
  if (!getProjectStore().has("voiceover")) {
    throw new Error("Voiceover not set");
  }
  return getProjectStore().get("voiceover") as Voiceover;
}

export function getProjectVisual(): Visual {
  if (!getProjectStore().has("visual")) {
    throw new Error("Visual not set");
  }
  return getProjectStore().get("visual") as Visual;
}

export function getProjectScript(): ScriptData[] {
    return getProjectStore().get("script", []) as ScriptData[];
}


export function getProjectTopics(): Topic[] {
  return getProjectStore().get("topics", []) as Topic[];
}
export function setProjectTopics(topics: Topic[]): void {
  getProjectStore().set("topics", topics);
}

export function setProjectTopic(topic: Topic): void {
  getProjectStore().set("topic", topic);
}
export function setProjectAudience(audience: Audience): void {
  getProjectStore().set("audience", audience);
}


export function setProjectHasAvatar(hasAvatar: boolean): void {
  getProjectStore().set("avatar", hasAvatar);
}
export function setProjectHasSubtitles(hasSubtitles: boolean): void {
  getProjectStore().set("subtitles", hasSubtitles);
}
export function setProjectVoiceover(voiceover: Voiceover): void {
  getProjectStore().set("voiceover", voiceover);
}
export function setProjectVisual(visual: Visual): void {
  getProjectStore().set("visual", visual);
}

export function setProjectScript(script: ScriptData[]): void {
    getProjectStore().set("script", script);
}