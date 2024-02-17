import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

const avatarList = [
  {label: "Default Man", avatarUrl: "big-person.png"}, 
  {label: "Lebron James", avatarUrl: "lebron.png"},
  {label: "Messi", avatarUrl: "messi.png"},
  {label: "Obama", avatarUrl: "obama.png"},
];

const formSchema = z.object({
  avatar: z.boolean().default(false).optional(),
  subtitles: z.boolean().default(false).optional(),
  selectedAvatar: z.string().default("big-person.png"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<FormValues> = {
  avatar: false,
  subtitles: false,
  selectedAvatar: "big-person.png",
};

export function SetVisuals() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(data: FormValues) {
    console.log(data);
    navigate("/welcome/script-editor");
  }
  const { avatar, subtitles, selectedAvatar } = form.watch();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
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
              {avatarList.map((avatar, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name="selectedAvatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl> 
                          <AvatarFrame label={avatar.label} avatarUrl={avatar.avatarUrl} onClick={() => field.onChange(avatar.avatarUrl)}/>
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
          avatarUrl={selectedAvatar ?? "big-person.png"}
          showAvatar={avatar}
          showSubtitle={subtitles}
        />

        <Button type="submit">Finish</Button>
      </form>
    </Form>
  );
}
