import { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card } from "react-bootstrap";
import Dropzone from "react-dropzone";

export interface FileType extends File {
  preview?: string;
  formattedSize?: string;

}

interface FileUploaderProps {
  onFileUpload?: (files: FileType[]) => void;
  showPreview?: boolean;
  isImage?: boolean
  isMulti?: boolean
}

const FileUploader = (props: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<FileType[]>([]);
  /**
   * Handled the accepted files and shows the preview
   */
  const handleAcceptedFiles = (files: FileType[]) => {
    const imageFiles = props.isImage
      ? files.filter(file => {
        const fileType = file.type.toLowerCase();
        return fileType === 'image/jpeg' ||
          fileType === 'image/jpg' ||
          fileType === 'image/png' ||
          fileType === 'image/gif' ||
          fileType === 'image/svg+xml';
      })
      : files;
    if (imageFiles.length === 0) return;

    if (props.isMulti) {
      let allFiles = imageFiles

      if (props.showPreview) {
        (files || []).map((file) =>
          Object.assign(file, {
            preview:
              file["type"].split("/")[0] === "image"
                ? URL.createObjectURL(file)
                : null,
            formattedSize: formatBytes(file.size),
          })
        );
        allFiles = [...selectedFile];
        allFiles.push(...files);
        setSelectedFile(allFiles);
      }
      if (props.onFileUpload) props.onFileUpload(allFiles);
    } else {
      const file = imageFiles[0];

      if (props.showPreview) {
        Object.assign(file, {
          preview: file["type"].split("/")[0] === "image" ? URL.createObjectURL(file) : null,
          formattedSize: formatBytes(file.size),
        });
        setSelectedFile([file]);
      }

      if (props.onFileUpload) props.onFileUpload([file]);
    }


  };

  /**
   * Formats the size
   */
  const formatBytes = (bytes: number, decimals: number = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  /*
   * Removes the selected file
   */
  const removeFile = (fileIndex: number) => {
    const newFiles = [...selectedFile];
    newFiles.splice(fileIndex, 1);
    setSelectedFile(newFiles);
    if (props.onFileUpload) props.onFileUpload(newFiles);
  };

  return (
    <>
      <Dropzone
        {...props}
        onDrop={(acceptedFiles) => handleAcceptedFiles(acceptedFiles)}
        multiple={false}
        accept={props.isImage ? { 'image/*': [] } : {'*': [] }}
      >
        {({ getRootProps, getInputProps }) => (
          <div className="dropzone">
            <div className="dz-message needsclick" {...getRootProps()}>
              <input {...getInputProps()} />
              <i className="h3 text-muted dripicons-cloud-upload"></i>
              <h4>Перетащите файлы сюда или нажмите, чтобы загрузить.</h4>
            </div>
          </div>
        )}
      </Dropzone>

      {props.showPreview && selectedFile && (
        <div className="dropzone-previews mt-3" id="uploadPreviewTemplate">
          {(selectedFile || []).map((file, index) => {
            return (
              <Card key={index + "-file"} className="mt-1 mb-0 shadow-none border">
                <div className="p-2">
                  <Row className="align-items-center">
                    {file.preview && (
                      <Col className="col-auto">
                        <img
                          data-dz-thumbnail=""
                          className="avatar-sm rounded bg-light"
                          alt={file.name}
                          src={file.preview}
                        />
                      </Col>
                    )}
                    <Col className="ps-0">
                      <Link to="#" className="text-muted fw-bold">
                        {file.name}
                      </Link>
                      <p className="mb-0">
                        <strong>{file.formattedSize}</strong>
                      </p>
                    </Col>
                    <Col className="text-end">
                      <Link
                        to="#"
                        className="btn btn-link btn-lg text-muted shadow-none"
                        onClick={() => removeFile(index)}
                      >
                        <i className="dripicons-cross"></i>
                      </Link>
                    </Col>
                  </Row>
                </div>
              </Card>
            )
          })}

        </div>
      )}
    </>
  );
};

FileUploader.defaultProps = {
  showPreview: true,
};

export default FileUploader;