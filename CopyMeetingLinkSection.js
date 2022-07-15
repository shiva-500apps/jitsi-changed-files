// @flow

import React,{useState,useEffect} from 'react';

import CopyButton from '../../../../base/buttons/CopyButton';
import { translate } from '../../../../base/i18n';
import { getDecodedURI } from '../../../../base/util';


type Props = {

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * The URL of the conference.
     */
    url: string
};

/**
 * Component meant to enable users to copy the conference URL.
 *
 * @returns {React$Element<any>}
 */
function CopyMeetingLinkSection({ t, url }: Props) {


    const [link, setLink] = useState('');
    useEffect(()=>{
        window.addEventListener("message", (event)=> {
            if (event.data.message == "embedded_url") {
             let link=event.data.link;
             setLink(link)
             }
            });
        window.parent.postMessage({
            message: 'embedded',details:{response:200}
        }, '*');
    })
    
    return (
        <>
            <label htmlFor = { 'copy-button-id' }>{t('addPeople.shareLink')}</label>
            <CopyButton
                aria-label = { t('addPeople.copyLink') }
                className = 'invite-more-dialog-conference-url'
                displayedText = { getDecodedURI(link) }
                id = 'copy-button-id'
                textOnCopySuccess = { t('addPeople.linkCopied') }
                textOnHover = { t('addPeople.copyLink') }
                textToCopy = { link } />
        </>
    );
}

export default translate(CopyMeetingLinkSection);
