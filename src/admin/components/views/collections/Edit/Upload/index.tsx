import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import useField from '../../../../forms/useField';
import Button from '../../../../elements/Button';
import FileDetails from '../../../../elements/FileDetails';
import Error from '../../../../forms/Error';
import { Props, Data } from './types';

import './index.scss';

const baseClass = 'file-field';

const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const validate = (value) => {
  if (!value && value !== undefined) {
    return 'A file is required.';
  }

  return true;
};

const Upload: React.FC<Props> = (props) => {
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const [selectingFile, setSelectingFile] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [replacingFile, setReplacingFile] = useState(false);

  const {
    data = {} as Data,
    collection,
  } = props;

  const { filename } = data;

  const {
    value,
    setValue,
    showError,
    errorMessage,
  } = useField<{ name: string }>({
    path: 'file',
    validate,
  });

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((count) => count + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((count) => count - 1);
    if (dragCounter > 1) return;
    setDragging(false);
  }, [dragCounter]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setValue(e.dataTransfer.files[0]);
      setDragging(false);

      e.dataTransfer.clearData();
      setDragCounter(0);
    } else {
      setDragging(false);
    }
  }, [setValue]);

  // Only called when input is interacted with directly
  // Not called when drag + drop is used
  // Or when input is cleared
  const handleInputChange = useCallback(() => {
    setSelectingFile(false);
    setValue(inputRef?.current?.files?.[0] || null);
  }, [inputRef, setValue]);

  useEffect(() => {
    if (selectingFile) {
      inputRef.current.click();
      setSelectingFile(false);
    }
  }, [selectingFile, inputRef, setSelectingFile]);

  useEffect(() => {
    const div = dropRef.current;
    if (div) {
      div.addEventListener('dragenter', handleDragIn);
      div.addEventListener('dragleave', handleDragOut);
      div.addEventListener('dragover', handleDrag);
      div.addEventListener('drop', handleDrop);

      return () => {
        div.removeEventListener('dragenter', handleDragIn);
        div.removeEventListener('dragleave', handleDragOut);
        div.removeEventListener('dragover', handleDrag);
        div.removeEventListener('drop', handleDrop);
      };
    }

    return () => null;
  }, [handleDragIn, handleDragOut, handleDrop, value]);

  useEffect(() => {
    setReplacingFile(false);
  }, [data]);

  const classes = [
    baseClass,
    dragging && `${baseClass}--dragging`,
    'field-type',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <Error
        showError={showError}
        message={errorMessage}
      />
      {(filename && !replacingFile) && (
        <FileDetails
          doc={data}
          collection={collection}
          handleRemove={() => {
            setReplacingFile(true);
            setValue(null);
          }}
        />
      )}
      {(!filename || replacingFile) && (
        <div className={`${baseClass}__upload`}>
          {value && (
            <div className={`${baseClass}__file-selected`}>
              <span
                className={`${baseClass}__filename`}
              >
                {value.name}
              </span>
              <Button
                icon="x"
                round
                buttonStyle="icon-label"
                iconStyle="with-border"
                onClick={() => {
                  setValue(null);
                }}
              />
            </div>
          )}
          {!value && (
            <React.Fragment>
              <div
                className={`${baseClass}__drop-zone`}
                ref={dropRef}
                onPaste={(e) => {
                  // handle pasted file
                  if (e.clipboardData.files.length) {
                    const fileObject = e.clipboardData.files[0];
                    setValue(fileObject || null);
                  }
                }}
              >
                <Button
                  size="small"
                  buttonStyle="secondary"
                  onClick={() => setSelectingFile(true)}
                  className={`${baseClass}__file-button`}
                >
                  Select a file
                </Button>
                <div className={`${baseClass}__or-other-options-container`}>
                  <p className={`${baseClass}__or-text`}>OR</p>
                  <div className={`${baseClass}__other-options`}>
                    <p>drag and drop a file</p>
                    <p>copy and paste a file</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={collection?.upload?.mimeTypes?.join(',')}
            onChange={handleInputChange}
          />
        </div>
      )}
    </div>
  );
};

export default Upload;
