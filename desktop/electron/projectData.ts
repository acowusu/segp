import { Audience, ScriptData, Topic, Visual, Voiceover, Avatar, ScriptSelections, BackingTrack } from "./mockData/data";
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
    const scriptData = getProjectStore().get("script_selections", []) as ScriptSelections[];
    const projectTopic = getProjectTopic();
    for (const {topic, script} of scriptData) {
      if (projectTopic.topic === topic) {
        return script as ScriptData[]
      }
    }
    return []
    
}


export function getProjectTopics(): Topic[] {
  return getProjectStore().get("topics", []) as Topic[];
}

export function getProjectAvatar(): Avatar {
  if (!getProjectStore().has("avatars")) {
    throw new Error("Selected avatar not set");
  }
  return getProjectStore().get("avatars") as Avatar;
}

export function setProjectAvatar(avatar: Avatar): void {
  getProjectStore().set("avatars", avatar);
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


// Strictly for updating an already existing script section, probably not the most efficient way
export function updateProjectScriptSection(new_section: ScriptData): void {
  
  const currentScript = getProjectScript();
  let found = false;
  for (let i = 0; i < currentScript.length; i++) {
    if (currentScript[i].id === new_section.id) {
      currentScript[i] = new_section
      found = true;
      break;
    }
  }
  if (found) {
    console.log("setProjectScriptSection: found the section, replacing it")
    setProjectScript(currentScript);
  }

  console.log("setProjectScriptSection: did not find the section, no replacement")

}

export function setProjectScript(new_script: ScriptData[]): void {
  const scriptSelection = getProjectStore().get("script_selections", []) as ScriptSelections[];
  let foundTopic = false;
  for (let i = 0; i < scriptSelection.length; i++) {
    if (getProjectTopic().topic === scriptSelection[i].topic) {
      scriptSelection[i] = {topic: getProjectTopic().topic, script: new_script};
      foundTopic = true;
      break;
    }
  }
  if (!foundTopic) {
    scriptSelection.push({topic: getProjectTopic().topic, script: new_script})
  }
  getProjectStore().set("script_selections", scriptSelection);
}


export function getProjectLength(): number {
  return getProjectStore().get("length", 1) as number;
}

export function setProjectLength(length: number): void {
  getProjectStore().set("length", length);
}
export function getProjectBackingTrack(): BackingTrack {
  if (!getProjectStore().has("backingTrack")) {
    throw new Error("Backing track not set");
  }
  return getProjectStore().get("backingTrack") as BackingTrack;
}
export function setProjectBackingTrack(backingTrack: BackingTrack): void {
  getProjectStore().set("backingTrack", backingTrack);
}