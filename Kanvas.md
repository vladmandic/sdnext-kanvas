# Kanvas

[Kanvas](https://github.com/vladmandic/sdnext-kanvas) is an advanced image editing module for [SD.Next](https://github.com/vladmandic/sdnext)  
with tools for upload, paste, paint, resize, crop, filters, text, outpaint, masking, and multi-stage workflows.

![Image](https://github.com/user-attachments/assets/54b25586-b611-4d70-a28f-ee3360944034)

> [!NOTE]
> Kanvas is enabled by default and available in unified **Control** interfaces in both *ModernUI* and *StandardUI*.  
> Legacy **Img2Img** continues to use standard *Gradio* image handling.

### Stages

Kanvas supports multiple stages.  
Each stage has its own **image layer** and **mask layer**, and each layer can contain multiple objects.

The stages panel appears above the shapes list and provides:
- Current active stage
- Stage thumbnails (from the stage image layer)
- Stage resolution
- Add stage (`+`)
- Delete stage (`×`) for non-primary stages

Rules and limits:
- Maximum of 10 stages
- Stage 1 cannot be deleted
- Clicking a stage switches active editing to that stage
- Clicking a stage without an image thumbnail opens upload

> [!IMPORTANT]
> Processing/export uses the **currently active stage only**.  
> Switch to the stage you want before sending to SD.Next.

> [!TIP]
> For a full-screen Kanvas experience, collapse left/right sidebars and output panel.

### Working with Objects

Objects can be **images**, **painted shapes** (for example brush strokes), or **text**.  
Objects are independent and can be selected, moved, transformed, cropped, filtered, or deleted.

Example:
1. Upload an image.
2. Click the image to select it.
3. Click *Move/Resize*.
4. Move or resize using mouse/touch.
5. Add additional images or drawings as separate objects.

> [!TIP]
> By default, the stage is auto-scaled to fit the visible area.  
> For precise edits, enable *Zoom lock* and work at 1:1 scale.

> [!TIP]
> To pan while zoomed in, hold *Ctrl* and drag.

### Shapes List

Kanvas shows a live shapes list for the active layer:
- Title shows active layer and shape count
- Every shape entry shows type and size
- Click a shape entry to select it on canvas

This is useful when shapes overlap and are hard to select directly.

### Text vs Image vs Inpaint

When processing starts, Kanvas rasterizes the **active stage** layers and SD.Next picks workflow by available inputs:
- If image is empty, SD.Next uses *text-to-image*
- If image exists, SD.Next uses *image-to-image*
- If mask exists, SD.Next uses *inpainting*

> [!NOTE]
> Deselecting active transforms before processing helps avoid accidental edits.

### Toolbar

<img width="760" height="37" alt="Image" src="https://github.com/user-attachments/assets/f6ef598d-aa32-4f9c-bc07-58e6b95b9971" />

### Layer Selection

Use *image layer* or *mask layer* button to choose the active editing layer.

### Upload / Paste / Remove / Reset

Use *upload* to add images to the active layer.  
Use *paste* to insert image content from clipboard.  
You can also drag-and-drop image files onto Kanvas.

Each uploaded image becomes a separate object.

Use *remove* to delete the currently selected object.

Use *reset* to clear Kanvas and reinitialize stage state (including stage list) to defaults.

### Opacity

Use the opacity slider to change opacity of the selected object.

### Move / Resize

Use *Move/Resize* to transform selected objects.

> [!TIP]
> If you move objects and leave large empty space, double-click an empty canvas area to fit stage size to content bounds.

### Crop

Use *crop* to crop selected image objects.

### Paint

Use *free paint* to draw on the active layer with brush settings.

### Outpaint

Typical outpaint flow:
1. Upload image to image layer.
2. Resize stage to target resolution.
3. Use *Move/Resize* to position the image.
4. Click *Outpaint* to enter outpaint mode.
5. Adjust blur/expand.
6. Click *Outpaint* again to apply.
7. Start SD.Next processing.

> [!NOTE]
> Higher expand values increase overlap, which can improve blending.

> [!IMPORTANT]
> Outpainting requires suitable *Input -> Denoising strength* in SD.Next (typically 0.65-0.85).

### Filters

Use *Filters* on selected objects:
1. Select object.
2. Click *Filters*.
3. Pick filter and adjust value.
4. Click *Filters* again to apply.

### Text

Use *Text* by setting font and text value, then dragging a text box on the stage.  
Text is created on the active layer.

### Zoom / Scale

Zoom with mouse wheel, touch gestures, or toolbar buttons.  
*Zoom lock* toggles auto-fit behavior to keep manual zoom/1:1 workflow.

### Settings

<img width="318" height="356" alt="Image" src="https://github.com/user-attachments/assets/1453e193-3108-4833-94fc-09359c75b68a" />

### Server-side Masking

SD.Next can generate masks server-side from input image (for example *Auto-segment* or *Auto-mask*), even when Kanvas mask layer is empty.

Example auto-mask using `BEN2` model:

<img width="1024" alt="Image" src="https://github.com/user-attachments/assets/85d44d3e-9a6f-4d7c-b88d-c8ebc61f8d41" />

Additionally, server options can post-process Kanvas masks:
- Blur: Gaussian blur
- Dilate/Erode: expand or shrink mask

These options can be previewed before processing.

### Disable Kanvas

> [!TIP]
> To disable Kanvas and use standard Gradio image handling, set:  
> `SD_DISABLE_KANVAS=true`

### Implementation

Kanvas is maintained in [sdnext-kanvas](https://github.com/vladmandic/sdnext-kanvas) and included as a submodule in SD.Next.  
It is built with [TypeScript](https://www.typescriptlang.org/) and [Konva.js](https://konvajs.org/) for canvas operations.
