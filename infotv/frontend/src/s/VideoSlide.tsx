import React from "react";
import { Slide } from "../types";
import { EditorProps, SlideModule, ViewProps } from "./types";

interface VideoSlide extends Slide {
    src: string;
    style: "loop" | "stopAtEnd" | "nextSlideAtEnd";
}

export const isVideoSlide = (slide: Slide): slide is VideoSlide => {
    return "style" in slide;
};

const VideoSlideView: React.FC<ViewProps<VideoSlide>> = (props) => {
    const { slide } = props;
    const videoRef = props.tv.state.videoRef;
    return (
        <div className="slide video-slide">
            <video
                src={slide.src}
                autoPlay
                muted
                ref={videoRef}
                loop={(slide.style ?? "loop") === "loop"}
            />
        </div>
    );
};

class VideoSlideEditor extends React.Component<EditorProps<VideoSlide>> {
    private setSrc = (event: any) => {
        this.props.slide.src = event.target.value;
        this.props.tv.forceUpdate();
    };

    private setStyle = (event: any) => {
        this.props.slide.style = event.target.value;
        this.props.tv.forceUpdate();
    };

    public render() {
        const { slide } = this.props;
        return (
            <div className="video-slide-editor">
                <label>
                    Videon osoite:
                    <input type="url" value={slide.src || ""} onChange={this.setSrc} />
                    <select value={slide.style} onChange={this.setStyle}>
                        <option key="loop" value="loop">
                            Loop
                        </option>
                        <option key="stopAtEnd" value="stopAtEnd">
                            Pysäytä videon loputtua
                        </option>
                        <option key="nextSlideAtEnd" value="nextSlideAtEnd">
                            Näytä seuraava slide videon loputtua
                        </option>
                    </select>
                </label>
            </div>
        );
    }
}

const module: SlideModule<VideoSlide> = {
    id: "video",
    view: VideoSlideView,
    editor: VideoSlideEditor,
};
export default module;
