import { Audience, Avatar, BackingTrack, ScriptData, Topic, Visual, Voiceover } from "../../electron/mockData/data";
import { IAPI } from "../../electron/routes";

export const mockApi:IAPI = {
    getProjectName: () => Promise.resolve("Test Project"),
    getScript: () => Promise.resolve([]),
    getProjectTopic: function (): Promise<Topic> {
        throw new Error("Function not implemented.");
    },
    getProjectAudience: function (): Promise<Audience> {
        throw new Error("Function not implemented.");
    },
    getProjectHasBackgroundAudio: function (): Promise<boolean> {
        throw new Error("Function not implemented.");
    },
    getProjectHasSoundEffect: function (): Promise<boolean> {
        throw new Error("Function not implemented.");
    },
    getProjectHasAvatar: function (): Promise<boolean> {
        throw new Error("Function not implemented.");
    },
    getProjectHasSubtitles: function (): Promise<boolean> {
        throw new Error("Function not implemented.");
    },
    getProjectSubtitleStyle: function (): Promise<string> {
        throw new Error("Function not implemented.");
    },
    getProjectVoiceover: function (): Promise<Voiceover> {
        throw new Error("Function not implemented.");
    },
    getProjectVisual: function (): Promise<Visual> {
        throw new Error("Function not implemented.");
    },
    getProjectScript: function (): Promise<ScriptData[]> {
        throw new Error("Function not implemented.");
    },
    getProjectTopics: function (): Promise<Topic[]> {
        throw new Error("Function not implemented.");
    },
    getProjectAvatar: function (): Promise<Avatar> {
        throw new Error("Function not implemented.");
    },
    setProjectAvatar: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectTopics: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectTopic: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectAudience: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectHasAvatar: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectHasSubtitles: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectSubtitleStyle: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectVoiceover: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectVisual: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectScript: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    getProjectLength: function (): Promise<number> {
        throw new Error("Function not implemented.");
    },
    setProjectLength: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    getProjectBackingTrack: function (): Promise<BackingTrack> {
        throw new Error("Function not implemented.");
    },
    setProjectBackingTrack: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectHasBackgroundAudio: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    setProjectHasSoundEffects: function (): Promise<void> {
        throw new Error("Function not implemented.");
    },
    getProjectPath: function (): Promise<string> {
        throw new Error("Function not implemented.");
    },
    getIsDev: function (): Promise<boolean> {
        throw new Error("Function not implemented.");
    },
    getLastProject: function (): Promise<string> {
        throw new Error("Function not implemented.");
    },
    getRecentProjects: function (): Promise<string[]> {
        throw new Error("Function not implemented.");
    },
    toDataURL: function (): Promise<string> {
        throw new Error("Function not implemented.");
        },
    generateTextFromLLM: async () => {
        throw new Error("Function not implemented.");
    },
    generateOpenJourneyImage:  async () => {
        throw new Error("Function not implemented.");
    },
    generateOpenJourneyPrompt:  async () => {
        throw new Error("Function not implemented.");
    },
    generateTopics:  async () => {
        throw new Error("Function not implemented.");
    },
    convertWebmToMp4:  async () => {
        throw new Error("Function not implemented.");
    },
    writeBlob:  async () => {
        throw new Error("Function not implemented.");
    },
    webmBLobToMp4:  async () => {
        throw new Error("Function not implemented.");
    },
    prepareMp4Blob:  async () => {
        throw new Error("Function not implemented.");
    },
    getAvatars:  async () => {
        throw new Error("Function not implemented.");
    },
    setAvatar:  async () => {
        throw new Error("Function not implemented.");
    },
    fetchImages:  async () => {
        throw new Error("Function not implemented.");
    },
    loadReport:  async () => {
        throw new Error("Function not implemented.");
    },
    setScript:  async () => {
        throw new Error("Function not implemented.");
    },
    getTopics:  async () => {
        throw new Error("Function not implemented.");
    },
    setTopic:  async () => {
        throw new Error("Function not implemented.");
    },
    getAudiences:  async () => {
        throw new Error("Function not implemented.");
    },
    setAudience:  async () => {
        throw new Error("Function not implemented.");
    },
    getServiceStatus:  async () => {
        throw new Error("Function not implemented.");
    },
    launchService:  async () => {
        throw new Error("Function not implemented.");
    },
    shutdownService:  async () => {
        throw new Error("Function not implemented.");
    },
    setVisual:  async () => {
        throw new Error("Function not implemented.");
    },
    getVisuals:  async () => {
        throw new Error("Function not implemented.");
    },
    setVoiceover:  async () => {
        throw new Error("Function not implemented.");
    },
    setLength:  async () => {
        throw new Error("Function not implemented.");
    },
    getVoiceovers:  async () => {
        throw new Error("Function not implemented.");
    },
    getDirectory:  async () => {
        throw new Error("Function not implemented.");
    },
    getFile:  async () => {
        throw new Error("Function not implemented.");
    },
    createProject:  async () => {
        throw new Error("Function not implemented.");
    },
    openProject:  async () => {
        throw new Error("Function not implemented.");
    },
    generateBackingTrack:  async () => {
        throw new Error("Function not implemented.");
    },
    textToAudio:  async () => {
        throw new Error("Function not implemented.");
    },
    generateAvatar:  async () => {
        throw new Error("Function not implemented.");
    },
    generateNewScript:  async () => {
        throw new Error("Function not implemented.");
    },
    generateSoundEffect:  async () => {
        throw new Error("Function not implemented.");
    },
    imageToVideo: async () => {
        throw new Error("Function not implemented.");
    },
}