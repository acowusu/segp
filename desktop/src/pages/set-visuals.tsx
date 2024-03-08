import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { OverlayPreview } from "../components/custom/overlay-preview";
import { Button } from "../components/ui/button";
import { AvatarFrame } from "../components/custom/avatarFrame";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";

import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Audience, Voiceover, Avatar } from "../../electron/mockData/data";
import { useCallback, useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  avatar: z.boolean().default(false).optional(),
  subtitles: z.boolean().default(false).optional(),
  subtitleStyle: z.string().default("80px sans-serif").optional(),
  subtitleSize: z.string().default("80px").optional(),
  fontType: z.string().default("sans-serif").optional(),
  backgroundAudio: z.boolean().default(false).optional(),
  soundEffects: z.boolean().default(false).optional(),
  audience: z
    .string({ required_error: "Please Select an Audience" })
    .default("").optional(),
  voiceover: z
    .string({ required_error: "Please Select an Voiceover" })
    .default("").optional(),
  videoLength: z.coerce
  .number({ required_error: "Please Select a video length" })
  .default(1).optional(),
  avatarSelection: z.string().default("").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: () => Promise<Partial<FormValues>> = async () => {
  return {
    avatar: await window.api.getProjectHasAvatar().catch(() => false)!,
    subtitles: await window.api.getProjectHasSubtitles().catch(() => false)!,
    subtitleStyle: await window.api.getProjectSubtitleStyle().catch(() => "80px sans-serif")!,
    subtitleSize: await window.api.getProjectSubtitleStyle().catch(() => "80px")!,
    fontType: await window.api.getProjectSubtitleStyle().catch(() => "sans-serif")!,
    audience: (await window.api.getProjectAudience().catch(() => ({ name: "" }))).name!,
    voiceover: (await window.api.getProjectVoiceover().catch(() => ({ id: "" }))).id!,
    backgroundAudio:  await window.api.getProjectHasBackgroundAudio().catch(()=>false)!,
    soundEffects:  await window.api.getProjectHasSoundEffect().catch(()=>false)!,
    videoLength: await window.api.getProjectLength(),
    avatarSelection: (await window.api.getProjectAvatar().catch(()=>({id:""}))).id!,
  }
};

export function SetVisuals() {
  const navigate = useNavigate();

  const [audienceItems, setAudienceItems] = useState<Audience[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<Audience>(
    {} as Audience
  );
  const [voiceoverItems, setVoiceoverItems] = useState<Voiceover[]>([]);
  const [selectedVoiceover, setSelectedVoiceover] = useState<Voiceover>(
    {} as Voiceover
  );
  const [avatarItems, setAvatarItems] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    {} as Avatar
  );

  const setAudience = useCallback(async (audience: Audience) => {
    if (audience !== undefined) {
      setSelectedAudience(audience);
      window.api.setAudience(audience);
    }
  }, []);
  const setVoiceover = useCallback(async (voiceover: Voiceover) => {
    if (voiceover !== undefined) {
      setSelectedVoiceover(voiceover);
      window.api.setVoiceover(voiceover);
    }
  }, []);
  const setAvatar = useCallback(async (avatar: Avatar) => {
    if (avatar !== undefined) {
      setSelectedAvatar(avatar);
      window.api.setAvatar(avatar);
    }
  }, []);

  useEffect(() => {
    window.api
      .getVoiceovers()
      .then((data) => {
        setVoiceoverItems(data);
      })
      .then(() =>
        window.api
          .getProjectVoiceover()
          .then((data) => {
            setVoiceover(data);
          })
          .catch((e) => {
            console.log(e);
          })
      );
  }, [setVoiceover]);

  useEffect(() => {
    window.api
      .getAudiences()
      .then((data) => {
        setAudienceItems(data);
      })
      .then(() =>
        window.api
          .getProjectAudience()
          .then((data) => {
            setAudience(data);
          })
          .catch((e) => {
            console.log(e);
          })
      );
  }, [setAudience]);

  useEffect(() => {
    window.api
      .getAvatars()
      .then((data) => {
        setAvatarItems(data);
      })
      .then(() =>
        window.api
          .getProjectAvatar()
          .then((data) => {
            setAvatar(data);
          })
          .catch((e) => {
            console.log(e);
          })
      );
  }, [setAvatar]);
  // const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data: FormValues) =>  {
    console.log(data);
    window.api.setProjectHasAvatar(data.avatar || false);
    window.api.setProjectHasSubtitles(data.subtitles || false);
    if (data.subtitles) {
      window.api.setProjectSubtitleStyle((data.subtitleSize + " " + data.fontType) || "80px sans-serif");
    } else {
      window.api.setProjectSubtitleStyle("80px sans-serif");
    }
    window.api.setProjectHasBackgroundAudio(data.backgroundAudio || false);
    window.api.setProjectHasSoundEffects(data.soundEffects || false);
    setVoiceover(voiceoverItems.find(item => item.id === data.voiceover)!)
    setAudience(audienceItems.find(item => item.name === data.audience)!)
    setAvatar(avatarItems.find(item => item.id === data.avatarSelection)!)
    navigate("/set-topic")
  }

  const { avatar, subtitles, subtitleSize, fontType, avatarSelection } = form.watch();
  return (
    <>
      <h1 className="text-4xl font-bold pb-8">
        Project Settings
      </h1>
      
      <Form {...form}>
        <form className="space-y-8 flex flex-col xl:flex-row gap-8">
          <div className="max-w-[40rem] w-full">
            <h3 className="mb-4 text-lg font-medium">Configuration</h3>
            <FormField
            control={form.control}
            name="videoLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Length</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormDescription>
                  Select Video Length
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audience</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedAudience?.name || " Select an Audience"} />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceItems.map((audienceItem) => (
                        <SelectItem
                          key={audienceItem.name}
                          value={audienceItem.name}
                        >
                          {audienceItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedAudience.description}
                  </FormDescription>
                </FormItem>
              )}
            />
            {avatar && (
              <div className="grid grid-cols-3 gap-4 ">
              {avatarItems.map((avatar, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name="avatarSelection"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl> 
                          <AvatarFrame 
                            isSelected={avatarSelection===avatar.id} 
                            label={avatar.name} 
                            imagePath={avatar.imagePath} 
                            onClick={() => field.onChange(avatar.id)}/>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
              </div>
            )}
            <FormField
              control={form.control}
              name="voiceover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voiceover</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                    <SelectValue placeholder={selectedVoiceover?.name || " Select a Voiceover"} />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceoverItems.map((voiceoverItem) => (
                        <SelectItem
                          key={voiceoverItem.name}
                          value={voiceoverItem.id}
                        >
                          {voiceoverItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedVoiceover.description}
                  </FormDescription>
                </FormItem>
              )}
            />
            <h3 className="mb-4 text-lg font-medium">Visuals</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Avatar</FormLabel>
                      <FormDescription>
                        Show a picture of the narrator of the script
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitles"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Subtitles</FormLabel>
                      <FormDescription>
                        Show subtitles on the video
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {subtitles && ( // Render subtitle size selector only if subtitles are enabled
                <FormField
                  control={form.control}
                  name="subtitleSize"
                  render={({ field }) => (
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Subtitle Size</FormLabel>
                      <div className="flex items-center space-x-4">
                        <button
                          className="subtitle-size-button"
                          style={{
                            border: field.value === "60px" ? "2px solid #4299e1" : "2px solid transparent",
                            boxShadow: field.value === "60px" ? "0 0 5px rgba(66, 153, 225, 0.5)" : "none",
                          }}
                          onClick={() => field.onChange("60px")}
                        >
                          <div className="subtitle-size-icon small-icon" style={{ fontSize: "12px" }}>T</div>
                        </button>
                        <button
                          className="subtitle-size-button"
                          style={{
                            border: field.value === "80px" ? "2px solid #4299e1" : "2px solid transparent",
                            boxShadow: field.value === "80px" ? "0 0 5px rgba(66, 153, 225, 0.5)" : "none",
                          }}
                          onClick={() => field.onChange("80px")}
                        >
                          <div className="subtitle-size-icon medium-icon" style={{ fontSize: "16px" }}>T</div>
                        </button>
                        <button
                          className="subtitle-size-button"
                          style={{
                            border: field.value === "100px" ? "2px solid #4299e1" : "2px solid transparent",
                            boxShadow: field.value === "100px" ? "0 0 5px rgba(66, 153, 225, 0.5)" : "none",
                          }}
                          onClick={() => field.onChange("100px")}
                        >
                          <div className="subtitle-size-icon large-icon" style={{ fontSize: "20px" }}>T</div>
                        </button>
                      </div>
                      {/* Add description or any other relevant information */}
                    </div>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="fontType"
                render={({ field }) => (
                  <div className="flex items-center space-x-4">
                    <button
                      className="font-type-button"
                      style={{
                        fontWeight: field.value === "sans-serif" ? "bold" : "normal",
                      }}
                      onClick={() => field.onChange("sans-serif")}
                    >
                      Sans-serif
                    </button>
                    <button
                      className="font-type-button"
                      style={{
                        fontWeight: field.value === "serif" ? "bold" : "normal",
                      }}
                      onClick={() => field.onChange("serif")}
                    >
                      Serif
                    </button>
                    {/* Add more font type buttons as needed */}
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="backgroundAudio"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Backing Track</FormLabel>
                      <FormDescription>
                        Turn on custom generated background audio
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soundEffects"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Sound Effects</FormLabel>
                      <FormDescription>
                        Add sound Effects to spice up your video
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">

          <h3 className="text-lg font-medium">Preview</h3>

            <OverlayPreview
              backgroundUrl={"example2-min.jpg"}
              avatarUrl={selectedAvatar.imagePath ?? "big-person.png"}
              showAvatar={avatar}
              showSubtitle={subtitles}
              subtitleStyle={subtitleSize + " " + fontType}
              />

              <Button onClick={() => onSubmit(form.getValues())}>Generate Topics</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
