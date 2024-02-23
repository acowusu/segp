import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { OverlayPreview } from "../components/custom/overlay-preview";
import { Button } from "../components/ui/button";
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
import { Audience, Voiceover } from "../../electron/mockData/data";
import { useCallback, useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  avatar: z.boolean().default(false).optional(),
  subtitles: z.boolean().default(false).optional(),
  audience: z
    .string({ required_error: "Please Select an Audience" })
    .default("").optional(),
  voiceover: z
    .string({ required_error: "Please Select an Voiceover" })
    .default("").optional(),
  videoLength: z.coerce
  .number({ required_error: "Please Select a video length" })
  .default(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: () => Promise<Partial<FormValues>> = async () => {
  return {
    avatar: await window.api.getProjectHasAvatar().catch(()=>false)!,
    subtitles:  await window.api.getProjectHasSubtitles().catch(()=>false)!,
    audience: ( await window.api.getProjectAudience().catch(()=>({name:""}))).name!,
    voiceover: (await window.api.getProjectVoiceover().catch(()=>({id:""}))).id!,
    videoLength: await window.api.getProjectLength(),
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
  const [selectedLength, setSelectedLength] = useState<number>(1);

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
  const setLength = useCallback(async (length: number) => {
    if (length !== undefined) {
      setSelectedLength(length);
      window.api.setLength(length);
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

  // const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const  onSubmit = useCallback((data: FormValues) =>  {
    console.log(data);
    window.api.setProjectHasAvatar(data.avatar || false);
    window.api.setProjectHasSubtitles(data.subtitles || false);
    setVoiceover(voiceoverItems.find(item => item.id === data.voiceover)!)
    setAudience(audienceItems.find(item => item.name === data.audience)!)
  }, [audienceItems, setAudience, setVoiceover, voiceoverItems])

  const {watch,handleSubmit }  = form
  useEffect(() => {
    // TypeScript users 
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe();
}, [watch, handleSubmit,  onSubmit]);
  const { avatar, subtitles } = form.watch();
  return (
    <>
      <h1 className="text-4xl font-bold pb-8">
        Project Settings
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
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
            </div>
          </div>
          <h3 className="text-lg font-medium">Preview</h3>

          <OverlayPreview
            backgroundUrl={"example2-min.jpg"}
            avatarUrl={"big-person.png"}
            showAvatar={avatar}
            showSubtitle={subtitles}
          />

          <Button onClick={() => navigate("/set-topic")}>Generate Topics</Button>
        </form>
      </Form>
    </>
  );
}
