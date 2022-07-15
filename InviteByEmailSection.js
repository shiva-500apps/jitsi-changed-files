// @flow

/* eslint-disable react/jsx-no-bind */

import React, { useState } from 'react';

import { isIosMobileBrowser } from '../../../../base/environment/utils';
import { translate } from '../../../../base/i18n';
import {
    Icon,
    IconArrowDownSmall,
    IconCopy,
    IconEmail,
    IconGoogle,
    IconOutlook,
    IconYahoo
} from '../../../../base/icons';
import { Tooltip } from '../../../../base/tooltip';
import { copyText } from '../../../../base/util';

type Props = {

    /**
     * The encoded invitation subject.
     */
    inviteSubject: string,

    /**
     * The encoded invitation text to be sent.
     */
    inviteText: string,

    /**
     * The encoded no new-lines iOS invitation text to be sent on default mail.
     */
    inviteTextiOS: string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,
};

/**
 * Component that renders email invite options.
 *
 * @returns {React$Element<any>}
 */
function InviteByEmailSection({ inviteSubject, inviteText, inviteTextiOS, t }: Props) {
    const [ isActive, setIsActive ] = useState(false);
    const encodedInviteSubject = encodeURIComponent(inviteSubject);
    const encodedInviteText = encodeURIComponent(inviteText);
    const encodedInviteTextiOS = encodeURIComponent(inviteTextiOS);

    const encodedDefaultEmailText = isIosMobileBrowser() ? encodedInviteTextiOS : encodedInviteText;

    /**
     * Copies the conference invitation to the clipboard.
     *
     * @returns {void}
     */
    function _onCopyText() {
        copyText(inviteText);
    }

    /**
     * Copies the conference invitation to the clipboard.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    function _onCopyTextKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            copyText(inviteText);
        }
    }

    /**
     * Toggles the email invite drawer.
     *
     * @returns {void}
     */
    function _onToggleActiveState() {
        setIsActive(!isActive);
    }

    /**
     * Toggles the email invite drawer.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    function _onToggleActiveStateKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setIsActive(!isActive);
        }
    }

    function openModal(){
        window.parent.postMessage({
            message: 'shareEmail',details:{response:200}
        }, '*');
    }

    /**
     * Renders clickable elements that each open an email client
     * containing a conference invite.
     *
     * @returns {React$Element<any>}
     */
    function renderEmailIcons() {
        const PROVIDER_MAPPING = [
            {
                icon: IconEmail,
                tooltipKey: 'addPeople.defaultEmail',
            }
        ];

        return (
            <>
                {
                    PROVIDER_MAPPING.map(({ icon, tooltipKey, url }, idx) => (
                        <Tooltip
                            content = { t(tooltipKey) }
                            key = { idx }
                            position = 'top'>
                            <a
                                aria-label = { t(tooltipKey) }
                                className = 'provider-icon'
                                href = { url }
                                rel = 'noopener noreferrer'
                                target = '_blank' onClick={openModal}>
                                <Icon src = { icon } />
                            </a>
                        </Tooltip>
                    ))
                }
            </>
        );

    }

    return (
        <>
            <div>
                <div
                    aria-expanded = { isActive }
                    aria-label = { t('addPeople.shareInvite') }
                    className = { `invite-more-dialog email-container${isActive ? ' active' : ''}` }
                    onClick = { _onToggleActiveState }
                    onKeyPress = { _onToggleActiveStateKeyPress }
                    role = 'button'
                    tabIndex = { 0 }>
                    <span>{t('addPeople.shareInvite')}</span>
                    <Icon src = { IconArrowDownSmall } />
                </div>
                <div className = { `invite-more-dialog icon-container${isActive ? ' active' : ''}` }>
                    {renderEmailIcons()}
                </div>
            </div>
        </>
    );
}

export default translate(InviteByEmailSection);
