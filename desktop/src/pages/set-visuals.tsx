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

const avatarList = [
  {label: "Default Man", avatarUrl: "big-person.png"}, 
  {label: "Lebron James", avatarUrl: "lebron.png"},
  {label: "Messi", avatarUrl: "messi.png"},
  {label: "Obama", avatarUrl: "obama.png"},
];

const formSchema = z.object({
  avatar: z.boolean().default(false).optional(),
  subtitles: z.boolean().default(false).optional(),
  audience: z
    .string({ required_error: "Please Select an Audience" })
    .default("").optional(),
  voiceover: z
    .string({ required_error: "Please Select an Voiceover" })
    .default("").optional(),
  avatarSelection: z.string().default("").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: () => Promise<Partial<FormValues>> = async () => {
  return {
    avatar: await window.api.getProjectHasAvatar().catch(()=>false)!,
    subtitles:  await window.api.getProjectHasSubtitles().catch(()=>false)!,
    audience: ( await window.api.getProjectAudience().catch(()=>({name:""}))).name!,
    voiceover: (await window.api.getProjectVoiceover().catch(()=>({id:""}))).id!,
    avatarSelection: (await window.api.getProjectAvatar().catch(()=>({id:""}))).id!,
  }
};

export function SetVisuals() {
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

  const onSubmit = useCallback((data: FormValues) =>  {
    console.log(data);
    window.api.setProjectHasAvatar(data.avatar || false);
    window.api.setProjectHasSubtitles(data.subtitles || false);
    setVoiceover(voiceoverItems.find(item => item.id === data.voiceover)!)
    setAudience(audienceItems.find(item => item.name === data.audience)!)
    setAvatar(avatarItems.find(item => item.id === data.avatarSelection)!)

  }, [audienceItems, setAudience, setVoiceover, voiceoverItems, avatarItems, setAvatar])

  const {watch,handleSubmit }  = form
  useEffect(() => {
    // TypeScript users 
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe();
}, [watch, handleSubmit,  onSubmit]);
  const { avatar, subtitles, avatarSelection } = form.watch();
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-medium">Configuration</h3>
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
            {avatar && (
              <div className="grid grid-cols-3 gap-4 overflow-auto no-scrollbar p-2 border-t-2 border-black">
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
          </div>
        </div>
        <h3 className="text-lg font-medium">Preview</h3>

        <OverlayPreview
          backgroundUrl={"example2-min.jpg"}
          avatarUrl={selectedAvatar.imagePath ?? "big-person.png"}
          showAvatar={avatar}
          showSubtitle={subtitles}
        />

        <Button type="submit">Finish</Button>
      </form>
    </Form>
  );
}
