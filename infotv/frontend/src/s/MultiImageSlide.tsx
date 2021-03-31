import React, {ChangeEvent, CSSProperties} from 'react';
import {forceInt, isImageURL} from '../utils';
import {Slide} from '../types';
import {EditorProps, SlideModule, ViewProps} from './types';

interface ParsedImage {
    duration: number;
    url: string;
}

function parseImage(line: string): ParsedImage | undefined {
    const m = /^(\d+)[;|](http.+)$/.exec(line);
    if (!m) {
        return;
    }
    const duration = forceInt(m[1]);
    if (duration <= 0) {
        return;
    }
    if (!isImageURL(m[2])) {
        return;
    }
    return {
        duration,
        url: m[2],
    };
}

function parseImages(data: string): ParsedImage[] {
    return `${data || ''}`.split('\n').map(parseImage).filter(v => v) as ParsedImage[];
}

interface MultiImageSlide extends Slide {
    config: string;
}

interface MultiImageSlideViewState {
    updateTimer?: number;
    deadline?: number;
    imageIndex: number;
    images: ParsedImage[];
}

class MultiImageSlideView extends React.Component<ViewProps<MultiImageSlide>, MultiImageSlideViewState> {
    constructor(props) {
        super(props);
        this.state = {
            imageIndex: 0,
            images: parseImages(props.slide.config),
        };
    }

    public UNSAFE_componentWillMount() {
        this.setState({
            updateTimer: window.setInterval(this.tick, 100),
        });
    }

    public componentWillUnmount() {
        clearInterval(this.state.updateTimer);
    }

    private tick = () => {
        let deadline;
        const now = +new Date();
        if (!this.state.deadline) {
            const slide = this.state.images[this.state.imageIndex];
            deadline = slide ? now + slide.duration : -1;
            this.setState({deadline});
            return;
        }
        if (this.state.deadline > 0 && now >= this.state.deadline) {
            this.setState({
                imageIndex: this.state.imageIndex + 1,
                deadline: undefined,
            });
        }
    };

    private reset = () => {
        const state = {deadline: 0, imageIndex: 0};
        this.setState(state);
    };

    public render() {
        let image: ParsedImage | undefined;
        if (this.state.images.length > 0) {
            const lastIndex = this.state.images.length - 1;
            const effIndex = Math.min(lastIndex, this.state.imageIndex);
            image = this.state.images[effIndex];
        }
        const style: CSSProperties = {};
        if (image) {
            style.backgroundImage = `url(${image.url})`;
        }
        return <div className="slide image-slide" style={style} onClick={this.reset}/>;
    }
}

class MultiImageSlideEditor extends React.Component<EditorProps<MultiImageSlide>, {}> {
    private setConfig = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.props.slide.config = event.target.value;
        this.props.tv.forceUpdate();
    };

    public render() {
        const {slide} = this.props;
        return (
            <div className="multi-image-slide-editor">
                <textarea
                    value={slide.config || ''}
                    onChange={this.setConfig}
                    placeholder="pituus (msek);HTTP-osoite ..."
                />
                <br/>
                {parseImages(slide.config).length} kelvollista kuvaa
            </div>
        );
    }
}

const module: SlideModule<MultiImageSlide> = {
    id: 'multi-image',
    view: MultiImageSlideView,
    editor: MultiImageSlideEditor,
};
export default module;
