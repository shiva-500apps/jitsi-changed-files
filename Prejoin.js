// @flow

import InlineDialog from '@atlaskit/inline-dialog';
import React, { Component } from 'react';
import { getRoomName } from '../../base/conference';
import { isNameReadOnly } from '../../base/config';
import { translate } from '../../base/i18n';
import { IconArrowDown, IconArrowUp, IconPhone, IconVolumeOff } from '../../base/icons';
import { isVideoMutedByUser } from '../../base/media';
import { ActionButton, InputField, PreMeetingScreen } from '../../base/premeeting';
import { connect } from '../../base/redux';
import { getDisplayName, updateSettings } from '../../base/settings';
import { getLocalJitsiVideoTrack } from '../../base/tracks';
import {
    joinConference as joinConferenceAction,
    joinConferenceWithoutAudio as joinConferenceWithoutAudioAction,
    setJoinByPhoneDialogVisiblity as setJoinByPhoneDialogVisiblityAction
} from '../actions';
import {
    isDeviceStatusVisible,
    isDisplayNameRequired,
    isJoinByPhoneButtonVisible,
    isJoinByPhoneDialogVisible
} from '../functions';

import DropdownButton from './DropdownButton';
import JoinByPhoneDialog from './dialogs/JoinByPhoneDialog';

type Props = {

    /**
     * Flag signaling if the device status is visible or not.
     */
    deviceStatusVisible: boolean,

    /**
     * If join by phone button should be visible.
     */
    hasJoinByPhoneButton: boolean,

    /**
     * Joins the current meeting.
     */
    joinConference: Function,

    /**
     * Joins the current meeting without audio.
     */
    joinConferenceWithoutAudio: Function,

    /**
     * The name of the user that is about to join.
     */
    name: string,

    /**
     * Updates settings.
     */
    updateSettings: Function,

    /**
     * The prejoin config.
     */
    prejoinConfig?: Object,

    /**
     * Whether the name input should be read only or not.
     */
    readOnlyName: boolean,

    /**
     * The name of the meeting that is about to be joined.
     */
    roomName: string,

    /**
     * Sets visibility of the 'JoinByPhoneDialog'.
     */
    setJoinByPhoneDialogVisiblity: Function,

    /**
     * Flag signaling the visibility of camera preview.
     */
    showCameraPreview: boolean,

    /**
     * If should show an error when joining without a name.
     */
    showErrorOnJoin: boolean,

    /**
     * If 'JoinByPhoneDialog' is visible or not.
     */
    showDialog: boolean,

    /**
     * Used for translation.
     */
    t: Function,

    /**
     * The JitsiLocalTrack to display.
     */
    videoTrack: ?Object
};

type State = {

    /**
     * Flag controlling the visibility of the error label.
     */
    showError: boolean,

    /**
     * Flag controlling the visibility of the 'join by phone' buttons.
     */
    showJoinByPhoneButtons: boolean,

    /**
     * Flag controlling based on visibility.
     */
     renderEmailOtp: boolean,
     email: String,
     verificationCode:Number,
     userName: String
}

/**
 * This component is displayed before joining a meeting.
 */
class Prejoin extends Component<Props, State> {
    /**
     * Initializes a new {@code Prejoin} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            showError: false,
            showJoinByPhoneButtons: false,
            renderEmailOtp: false,
            email: "",
            verificationCode: 0,
            userName: ""
        };
        this._closeDialog = this._closeDialog.bind(this);
        this._showDialog = this._showDialog.bind(this);
        this._onJoinButtonClick = this._onJoinButtonClick.bind(this);
        this._onDropdownClose = this._onDropdownClose.bind(this);
        this._onOptionsClick = this._onOptionsClick.bind(this);
        this._setName = this._setName.bind(this);
        this._onJoinConferenceWithoutAudioKeyPress = this._onJoinConferenceWithoutAudioKeyPress.bind(this);
        this._showDialogKeyPress = this._showDialogKeyPress.bind(this);
        this._onJoinKeyPress = this._onJoinKeyPress.bind(this);
        this._getExtraJoinButtons = this._getExtraJoinButtons.bind(this);
        this._otpValue = this._otpValue.bind(this);
        this._emailValue = this._emailValue.bind(this);
        this._joinConferenceWithoutAudio=this._joinConferenceWithoutAudio.bind(this);
        this._onJoinConferenceWithoutAudioKeyPress=this._onJoinConferenceWithoutAudioKeyPress.bind(this);

    }
    _onJoinButtonClick: () => void;

    _emailValue(event){
     this.setState({email:event.target.value});
    }

    _otpValue(event){
        this.setState({verificationCode:event.target.value});
    }

    /**
     * Handler for the join button.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onJoinButtonClick() {
        let that=this;
        console.log('ssssssssssssss')
        window.parent.postMessage({
            message: 'verify_user',details:{
                name:that.state.userName,
                verificationCode:that.state.verificationCode,
                email:that.state.email,
                audio:true
            }
        }, '*');
        if (this.props.showErrorOnJoin) {
            this.setState({
                showError: true
            });

            return;
        }
        this.setState({ showError: false });
    }

    _onJoinKeyPress: (Object) => void;

    /**
     * KeyPress handler for accessibility.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    _onJoinKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this._onJoinButtonClick();
        }
    }

    _onDropdownClose: () => void;

    /**
     * Closes the dropdown.
     *
     * @returns {void}
     */
    _onDropdownClose() {
        this.setState({
            showJoinByPhoneButtons: false
        });
    }

    _onOptionsClick: () => void;

    /**
     * Displays the join by phone buttons dropdown.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onOptionsClick(e) {
        e.stopPropagation();

        this.setState({
            showJoinByPhoneButtons: !this.state.showJoinByPhoneButtons
        });
    }

    _setName: () => void;

    /**
     * Sets the guest participant name.
     *
     * @param {string} displayName - Participant name.
     * @returns {void}
     */
    _setName(displayName) {
        this.setState({userName:displayName});
        this.props.updateSettings({
            displayName
        });
    }

    _closeDialog: () => void;

    /**
     * Closes the join by phone dialog.
     *
     * @returns {undefined}
     */
    _closeDialog() {
        this.props.setJoinByPhoneDialogVisiblity(false);
    }

    _showDialog: () => void;

    /**
     * Displays the dialog for joining a meeting by phone.
     *
     * @returns {undefined}
     */
    _showDialog() {
        this.props.setJoinByPhoneDialogVisiblity(true);
        this._onDropdownClose();
    }

    _showDialogKeyPress: (Object) => void;

    /**
     * KeyPress handler for accessibility.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    _showDialogKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this._showDialog();
        }
    }

    _onJoinConferenceWithoutAudioKeyPress: (Object) => void;

    /**
     * KeyPress handler for accessibility.
     *
     * @param {Object} e - The key event to handle.
     *
     * @returns {void}
     */
    _onJoinConferenceWithoutAudioKeyPress(e) {
        if (this.props.joinConferenceWithoutAudio
            && (e.key === ' '
                || e.key === 'Enter')) {
            e.preventDefault();
            let that=this;
            window.parent.postMessage({
                message: 'verify_user',details:{
                    name:that.state.userName,
                    verificationCode:that.state.verificationCode,
                    email:that.state.email,
                    audio: false
                }
            }, '*');
        }
    }
    _joinConferenceWithoutAudio(e){
        let that=this;
        window.parent.postMessage({
            message: 'verify_user',details:{
                name:that.state.userName,
                verificationCode:that.state.verificationCode,
                email:that.state.email,
                audio: false
            }
        }, '*');
    }

    _getExtraJoinButtons: () => Object;

    /**
     * Gets the list of extra join buttons.
     *
     * @returns {Object} - The list of extra buttons.
     */
    _getExtraJoinButtons() {
        const { joinConferenceWithoutAudio, t } = this.props;

        const noAudio = {
            key: 'no-audio',
            dataTestId: 'prejoin.joinWithoutAudio',
            icon: IconVolumeOff,
            label: t('prejoin.joinWithoutAudio'),
            onButtonClick: this._joinConferenceWithoutAudio,
            onKeyPressed: this._onJoinConferenceWithoutAudioKeyPress
        };

        const byPhone = {
            key: 'by-phone',
            dataTestId: 'prejoin.joinByPhone',
            icon: IconPhone,
            label: t('prejoin.joinAudioByPhone'),
            onButtonClick: this._showDialog,
            onKeyPressed: this._showDialogKeyPress
        };

        return {
            noAudio,
            byPhone
        };
    }
    componentDidMount() {
        let that=this;
        window.addEventListener("message", (event)=> {
            if (event.data.message == "navigate_jitsi") {
            if(event.data.visibility=='Private')
            that.setState({renderEmailOtp:true})
            }
            if(event.data.message == 'load_jitsi_meet')
            {
            if(!event.data.audio){
                that.props.joinConferenceWithoutAudio();
                return '';
            }
            that.props.joinConference();}
        });
    }
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            deviceStatusVisible,
            hasJoinByPhoneButton,
            joinConference,
            joinConferenceWithoutAudio,
            name,
            prejoinConfig,
            readOnlyName,
            showCameraPreview,
            showDialog,
            t,
            videoTrack
        } = this.props;
        const { _closeDialog, _onDropdownClose, _onJoinButtonClick, _onJoinKeyPress,
            _onOptionsClick, _setName,_emailValue,_otpValue } = this;

        const extraJoinButtons = this._getExtraJoinButtons();
        let extraButtonsToRender = Object.values(extraJoinButtons).filter((val: Object) =>
            !(prejoinConfig?.hideExtraJoinButtons || []).includes(val.key)
        );

        if (!hasJoinByPhoneButton) {
            extraButtonsToRender = extraButtonsToRender.filter((btn: Object) => btn.key !== 'by-phone');
        }
        const hasExtraJoinButtons = Boolean(extraButtonsToRender.length);
        const { showJoinByPhoneButtons, showError, renderEmailOtp } = this.state;

        return (
            <PreMeetingScreen
                showDeviceStatus = { deviceStatusVisible }
                title = { t('prejoin.joinMeeting') }
                videoMuted = { !showCameraPreview }
                videoTrack = { videoTrack }>
                <div
                    className = 'prejoin-input-area'
                    data-testid = 'prejoin.screen'>
                    <InputField
                        autoComplete = { 'name' }
                        autoFocus = { true }
                        className = { showError ? 'error' : '' }
                        hasError = { showError }
                        onChange = { _setName }
                        onSubmit = { joinConference }
                        placeHolder = { t('dialog.enterDisplayName') }
                        readOnly = { readOnlyName }
                        value = { name } />
                   { renderEmailOtp ?
                     <div>
                        <input type="email" id="email" className="field" placeholder = 'Please enter email here' name="email" onInput={_emailValue}/>
                        <input
                            type="number"
                            className="field"
                            id="otp"
                            placeholder = 'Please enter otp here'
                            onInput={_otpValue}
                        ></input>
                  </div>
                   : null }
                    {showError && <div
                        className = 'prejoin-error'
                        data-testid = 'prejoin.errorMessage'>{t('prejoin.errorMissingName')}</div>}

                    <div className = 'prejoin-preview-dropdown-container'>
                        <InlineDialog
                            content = { hasExtraJoinButtons && <div className = 'prejoin-preview-dropdown-btns'>
                                {extraButtonsToRender.map(({ key, ...rest }: Object) => (
                                    <DropdownButton
                                        key = { key }
                                        { ...rest } />
                                ))}
                            </div> }
                            isOpen = { showJoinByPhoneButtons }
                            onClose = { _onDropdownClose }>
                            <ActionButton
                                OptionsIcon = { showJoinByPhoneButtons ? IconArrowUp : IconArrowDown }
                                ariaDropDownLabel = { t('prejoin.joinWithoutAudio') }
                                ariaLabel = { t('prejoin.joinMeeting') }
                                ariaPressed = { showJoinByPhoneButtons }
                                hasOptions = { hasExtraJoinButtons }
                                onClick = { _onJoinButtonClick }
                                disabled = { renderEmailOtp?((this.state.email.trim().length && this.state.verificationCode && (name||'').trim().length) ? false : true ): ((name||'').trim().length?false:true) }
                                onKeyPress = { _onJoinKeyPress }
                                onOptionsClick = { _onOptionsClick }
                                role = 'button'
                                tabIndex = { 0 }
                                testId = 'prejoin.joinMeeting'
                                type = 'primary'>
                                { t('prejoin.joinMeeting') }
                            </ActionButton>
                        </InlineDialog>
                    </div>
                </div>
                { showDialog && (
                    <JoinByPhoneDialog
                        joinConferenceWithoutAudio = { joinConferenceWithoutAudio }
                        onClose = { _closeDialog } />
                )}
            </PreMeetingScreen>
        );
    }
}

/**
 * Maps (parts of) the redux state to the React {@code Component} props.
 *
 * @param {Object} state - The redux state.
 * @returns {Object}
 */
function mapStateToProps(state): Object {
    const name = getDisplayName(state);
    const showErrorOnJoin = isDisplayNameRequired(state) && !name;

    return {
        name,
        deviceStatusVisible: isDeviceStatusVisible(state),
        roomName: getRoomName(state),
        showDialog: isJoinByPhoneDialogVisible(state),
        showErrorOnJoin,
        hasJoinByPhoneButton: isJoinByPhoneButtonVisible(state),
        readOnlyName: isNameReadOnly(state),
        showCameraPreview: !isVideoMutedByUser(state),
        videoTrack: getLocalJitsiVideoTrack(state),
        prejoinConfig: state['features/base/config'].prejoinConfig
    };
}

const mapDispatchToProps = {
    joinConferenceWithoutAudio: joinConferenceWithoutAudioAction,
    joinConference: joinConferenceAction,
    setJoinByPhoneDialogVisiblity: setJoinByPhoneDialogVisiblityAction,
    updateSettings
};

export default connect(mapStateToProps, mapDispatchToProps)(translate(Prejoin));
