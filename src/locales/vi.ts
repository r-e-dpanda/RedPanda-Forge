import { LocaleStrings } from './en';

export const strings: LocaleStrings = {
  common: {
    cancel: "Hủy",
    save: "Lưu",
    reset: "Đặt lại",
    close: "Đóng",
    export: "Xuất",
    import: "Nhập",
    open: "Mở",
    delete: "Xóa",
    edit: "Sửa",
    untitled: "Untitled Graphic",
    all: "Tất cả"
  },
  settings: {
    header: "Cài đặt",
    tabs: {
      general: "Cài đặt chung",
      paths: "Đường dẫn"
    },
    appearance: {
      title: "Giao diện",
      description: "Chọn giao diện làm việc để tập trung tối ưu.",
      themeLibrary: "Giao diện",
      typography: "Văn bản & Tỷ lệ",
      typographyDesc: "Điều chỉnh kích thước chữ hiển thị của giao diện.",
      uiScale: "Tỷ lệ giao diện",
      currentBase: "Kích thước gốc",
      language: "Ngôn ngữ",
      languageDesc: "Chọn ngôn ngữ hiển thị."
    },
    paths: {
      title: "Vị trí lưu trữ",
      description: "Cấu hình thư mục chứa Assets và Templates.",
      assetsRoot: "Assets",
      templatesRoot: "Templates"
    },
    saveConfig: "Lưu Cấu Hình",
    ready: "Sẵn sàng."
  },
  sidebar: {
    tabs: {
      matches: "Trận Đấu",
      templates: "Templates"
    },
    filters: {
      ratio: "Tỷ lệ",
      template: "Template",
      allRatios: "Tất cả tỷ lệ"
    },
    matches: {
      header: "Các trận đấu",
      selectTemplateFirst: "Chọn Template trước",
      noMatchesFound: "Không tìm thấy trận đấu nào."
    },
    templates: {
      importBtn: "Nhập JSON",
      noTemplates: "Không có template",
      useTemplate: "Sử dụng Template"
    }
  },
  workspace: {
    tabs: {
      untitled: "Untitled Graphic"
    },
    modals: {
      closeTab: {
        header: "Đóng tab?",
        description: "Bạn có {changes} thay đổi chưa lưu {/changes}. Đóng tab này sẽ xóa bỏ vĩnh viễn mọi chỉnh sửa của bạn.",
        confirm: "Bỏ thay đổi & Đóng"
      }
    },
    actions: {
      export: "Xuất file",
      undo: "Phục hồi",
      redo: "Làm lại",
      newGraphic: "Tạo đồ họa"
    }
  },
  modals: {
    templateSwitch: {
      header: "Thay đổi template",
      description: "Bạn có chỉnh sửa thủ công chưa lưu. Thay đổi template sẽ {discard} HỦY BỎ {/discard} toàn bộ công sức của bạn.",
      openNewTab: "Mở trong tab mới",
      discardReplace: "Bỏ chỉnh sửa & Thay thế"
    }
  },
  panels: {
    tabs: {
      match: "Dữ liệu",
      design: "Thiết kế",
      layers: "Lớp"
    },
    sections: {
      content: "Nội dung",
      layout: "Bố cục",
      fill: "Tô màu",
      appearance: "Hiển thị",
      outline: "Đường viền",
      shadow: "Đổ bóng",
      typography: "Văn bản",
      background: "Nền",
      layers: "Các lớp"
    },
    fields: {
      sourceBindingPath: "Nguồn - Binding",
      source: "Nguồn",
      valueBindingPath: "Giá trị - Binding",
      value: "Giá trị",
      transform: "Bộ lọc",
      clear: "Xóa",
      addPipeline: "+ Thêm bộ lọc...",
      reset: "Đặt lại",
      enable: "Kích hoạt",
      opacity: "Độ trong suốt",
      width: "Độ rộng",
      height: "Độ cao",
      color: "Màu sắc",
      blur: "Độ mờ",
      offsetX: "Lệch X",
      offsetY: "Lệch Y",
      fontFamily: "Phông chữ",
      weight: "Độ đậm",
      size: "Cỡ chữ",
      lineHeight: "Khoảng cách dòng",
      letterSpacing: "Khoảng cách chữ",
      cornerRadius: "Bo góc",
      padding: "Khoảng lề trong",
      radius: "Bán kính",
      skewX: "Xoay dọc (Skew X)",
      topWidth: "Cạnh trên",
      align: "Căn lề",
      rotation: "Độ xoay",
      mirroring: "Đối xứng",
      flipX: "Lật Ngang",
      flipY: "Lật Dọc",
      venue: "Sân vận động",
      date: "Ngày thi đấu",
      kickoff: "Thời gian",
      matchup: "Cặp đấu",
      details: "Chi tiết",
      dataSources: "Nguồn Dữ Liệu",
      layerGroups: "Nhóm Lớp",
      backToLayers: "Trở lại danh sách Lớp"
    }
  }
};
