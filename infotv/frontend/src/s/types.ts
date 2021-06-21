import { Config, Slide } from "../types";
import TVApp from "../TVApp";
import EditorComponent from "../EditorComponent";

export interface SlideModule<SlideType extends Slide = Slide> {
    id: string;
    view: React.ComponentClass<ViewProps<SlideType>> | React.FC<ViewProps<SlideType>>;
    editor?: React.ComponentClass<EditorProps<SlideType>> | React.FC<EditorProps<SlideType>>;
}

export interface ViewProps<SlideType extends Slide = Slide> {
    config: Config;
    slide: SlideType;
    tv: TVApp;
}

export interface EditorProps<SlideType extends Slide = Slide> {
    config: Config;
    slide: SlideType;
    tv: TVApp;
    editor: EditorComponent;
}
