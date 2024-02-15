import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
} from "../components/ui/form";

import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const formSchema = z.object({
  avatar: z.boolean().default(false).optional(),
  subtitles: z.boolean().default(false).optional(),
  audience:z.string({required_error:"Please Select an Audience"}).default(""),
  voiceover:z.string({required_error:"Please Select an Audience"}).default("")

});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<FormValues> = {
  avatar: false,
  subtitles: false,
  audience:"",
  voiceover:"",
};

export function SetVisuals() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(data: FormValues) {
    console.log(data);
    window.api.setProjectHasAvatar(data.avatar || false);
    window.api.setProjectHasSubtitles(data.subtitles || false);
    navigate("/welcome/script-editor");
  }
  const { avatar, subtitles } = form.watch();
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
        <h3 className="mb-4 text-lg font-medium">Visuals</h3>
        <h3 className="mb-4 text-lg font-medium">Visuals</h3>
        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audience</FormLabel>
        <Select  onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger >
      <SelectValue  placeholder=" Select an Audience" />
      </SelectTrigger>
      <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={item.name}
                  value={item.name}
                >
                  {item.name}
                </SelectItem>
              ))}
         
      </SelectContent>
    </Select>
    <FormDescription>
                You can manage email addresses in your{" "}
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

        <Button type="submit">Finish</Button>
      </form>
    </Form>
  );
}
