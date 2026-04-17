# Multi-image Support

Kanvas currently supports single Konva stage with two layers: image and mask.
We want to add support for multiple stages, each with its own image and mask layer. This will allow users to work with multiple images simultaneously, each with its own set of annotations.

User should be able to create new stages, switch between them, and delete stages as needed. Each stage should maintain its own state, including the image, mask, and any annotations.

Note that first stage cannot be deleted, but additional stages can be created and deleted as needed. This will allow users to manage their workspace effectively while ensuring that they always have at least one stage to work with.

List of stages should be present in the UI, allowing users to easily switch between them. Each stage should be clearly labeled, and users should be able to see which stage is currently active. Controls to add/remove/list stages should be presented in a similar fashion and just above list of shapes. Selection for each stage should be a small thumbnail of the image, so users can easily identify which stage they want to work with.

Existing methods such as getImage and getImageData should be updated to work with the currently active stage, ensuring that users can easily access the image data for the stage they are working on. This will allow users to seamlessly integrate multi-image support into their workflow without any disruption.
