import DummyEditor from './DummyEditor';
import TextSlide from './TextSlide';
import ImageSlide from './ImageSlide';
import MultiImageSlide from './MultiImageSlide';
import NowNextSlide from './NowNextSlide';
import SocialSlide from './SocialSlide';
import AnimeSlide from './AnimeSlide';
import {SlideModule} from './types';

export const slideModules: { [id: string]: SlideModule<any> } = {
    text: TextSlide,
    image: ImageSlide,
    'multi-image': MultiImageSlide,
    nownext: NowNextSlide,
    social: SocialSlide,
    anime: AnimeSlide,
};
Object.values(slideModules).forEach((slideModule) => {
    if (!slideModule.editor) {
        slideModule.editor = DummyEditor;
    }
});
export default slideModules;
