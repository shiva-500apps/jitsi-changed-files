// @flow

import React,{  useEffect,useState }  from 'react';
import { connect } from 'react-redux';

import CopyButton from '../../base/buttons/CopyButton';
import { getInviteURL } from '../../base/connection';
import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';

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
 * Allow users to embed a jitsi meeting in an iframe.
 *
 * @returns {React$Element<any>}
 */
function EmbedMeeting({ t, url }: Props) {
    const [frameUrl, setUrl] = useState('');
    let iframe_url='';
    useEffect(() => {
        window.addEventListener("message", (event)=> {
            if (event.data.message == "embedded_url") {
        let iframeUrl=`<iframe allow="camera; microphone; fullscreen; display-capture; autoplay" src="${event.data.link}"`
        + ' style="height: 100%; width: 100%; border: 0px;"></iframe>';
        setUrl(iframeUrl)
             }
            });
        window.parent.postMessage({
            message: 'embedded',details:{response:200}
        }, '*');
      });
    /**
     * Get the embed code for a jitsi meeting.
     *
     * @returns {string} The iframe embed code.
     */
    const getEmbedCode = (iframe_url) =>{      
        `<iframe allow="camera; microphone; fullscreen; display-capture; autoplay" src="${iframe_url}"`
        + ' style="height: 100%; width: 100%; border: 0px;"></iframe>';}

    return (
        <Dialog
            hideCancelButton = { true }
            submitDisabled = { true }
            titleKey = { 'embedMeeting.title' }
            width = 'small'>
            <div className = 'embed-meeting-dialog'>
                <textarea
                    aria-label = { t('dialog.embedMeeting') }
                    className = 'embed-meeting-code'
                    readOnly = { true }
                    value = { frameUrl } />
                <CopyButton
                    aria-label = { t('addPeople.copyLink') }
                    className = 'embed-meeting-copy'
                    displayedText = { t('dialog.copy') }
                    textOnCopySuccess = { t('dialog.copied') }
                    textOnHover = { t('dialog.copy') }
                    textToCopy = { frameUrl } />
            </div>
        </Dialog>
    );
}

const mapStateToProps = state => {
    return {
        url: getInviteURL(state)
    };
};

export default translate(connect(mapStateToProps)(EmbedMeeting));
