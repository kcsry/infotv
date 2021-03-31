import React, {CSSProperties} from 'react';
import {isImageURL} from '../utils';
import {Slide} from '../types';
import {EditorProps, SlideModule, ViewProps} from './types';

interface ImageSlide extends Slide {
    src: string;
}

const ImageSlideView: React.FC<ViewProps<ImageSlide>> = (props) => {
    const {slide} = props;
    const url = slide.src;
    const style: CSSProperties = {};
    if (isImageURL(url)) {
        style.backgroundImage = `url(${url})`;
    }
    return <div className="slide image-slide" style={style}/>;
};

class ImageSlideEditor extends React.Component<EditorProps<ImageSlide>> {
    private setSrc = (event: any) => {
        this.props.slide.src = event.target.value;
        this.props.tv.forceUpdate();
    };

    public render() {
        const {slide} = this.props;
        return (
            <div className="image-slide-editor">
                <label>
                    Kuvan osoite:{' '}
                    <input type="url" value={slide.src || ''} onChange={this.setSrc}/>
                </label>
            </div>
        );
    }
}

const module: SlideModule<ImageSlide> = {
    id: 'image',
    view: ImageSlideView,
    editor: ImageSlideEditor,
};
export default module;
