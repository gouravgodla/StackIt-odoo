
import React from 'react';
import ReactQuill from 'react-quill';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'],
    [{ 'align': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'image', 'align'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder || 'Write your content here...'}
      className="bg-gray-800 rounded-lg"
    />
  );
};
