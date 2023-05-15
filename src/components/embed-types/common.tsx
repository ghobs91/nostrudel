import { Box, Image, ImageProps, Link, useDisclosure } from "@chakra-ui/react";
import { EmbedableContent, embedJSX } from "../../helpers/embeds";
import appSettings from "../../services/app-settings";
import { ImageGalleryLink } from "../image-gallery";

const BlurredImage = (props: ImageProps) => {
  const { isOpen, onOpen } = useDisclosure();
  return (
    <Box overflow="hidden">
      <Image onClick={onOpen} cursor="pointer" filter={isOpen ? "" : "blur(1.5rem)"} {...props} />
    </Box>
  );
};

// note1n06jceulg3gukw836ghd94p0ppwaz6u3mksnnz960d8vlcp2fnqsgx3fu9
export function embedImages(content: EmbedableContent, trusted = false) {
  return embedJSX(content, {
    regexp:
      /https?:\/\/([\dA-z\.-]+\.[A-z\.]{2,6})((?:\/[\+~%\/\.\w\-_]*)?\.(?:svg|gif|png|jpg|jpeg|webp|avif))(\??(?:[\?#\-\+=&;%@\.\w_]*)#?(?:[\-\.\!\/\\\w]*))?/i,
    render: (match) => {
      const ImageComponent = trusted || !appSettings.value.blurImages ? Image : BlurredImage;
      const thumbnail = appSettings.value.imageProxy
        ? new URL(`/256,fit/${match[0]}`, appSettings.value.imageProxy).toString()
        : match[0];
      const src = match[0];

      return (
        <ImageGalleryLink href={src} target="_blank" display="block" mx="-2">
          <ImageComponent src={thumbnail} cursor="pointer" maxW="30rem" w="full" />
        </ImageGalleryLink>
      );
    },
    name: "Image",
  });
}

export function embedVideos(content: EmbedableContent) {
  return embedJSX(content, {
    name: "Video",
    regexp:
      /https?:\/\/([\dA-z\.-]+\.[A-z\.]{2,6})((?:\/[\+~%\/\.\w\-_]*)?\.(?:mp4|mkv|webm|mov))(\??(?:[\?#\-\+=&;%@\.\w_]*)#?(?:[\-\.\!\/\\\w]*))?/i,
    render: (match) => <video src={match[0]} controls style={{ maxWidth: "30rem", maxHeight: "20rem" }} />,
  });
}

// based on http://urlregex.com/
// note1c34vht0lu2qzrgr4az3u8jn5xl3fycr2gfpahkepthg7hzlqg26sr59amt
export function embedLinks(content: EmbedableContent) {
  return embedJSX(content, {
    name: "Link",
    regexp:
      /https?:\/\/([\dA-z\.-]+\.[A-z\.]{2,6})((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\-\.\!\/\\\w]*))?/i,
    render: (match) => (
      <Link color="blue.500" href={match[0]} target="_blank" isExternal>
        {match[0]}
      </Link>
    ),
  });
}