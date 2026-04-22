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
    untitled: "Graphic chưa đặt tên",
    all: "Tất cả"
  },
  settings: {
    header: "Cài đặt ứng dụng",
    tabs: {
      general: "Tùy chọn chung",
      paths: "Đường dẫn không gian làm việc"
    },
    appearance: {
      title: "Giao diện",
      description: "Chọn giao diện không gian làm việc ưu tiên để tập trung tối ưu.",
      themeLibrary: "Thư viện giao diện",
      typography: "Văn bản & Tỷ lệ",
      typographyDesc: "Điều chỉnh kích thước giao diện để phù hợp với màn hình hiển thị.",
      uiScale: "Tỷ lệ giao diện",
      currentBase: "Kích thước gốc",
      language: "Ngôn ngữ",
      languageDesc: "Chọn ngôn ngữ hiển thị cho không gian làm việc."
    },
    paths: {
      title: "Vị trí lưu trữ",
      description: "Cấu hình thư mục chứa nguyên liệu và template cục bộ.",
      assetsRoot: "Thư mục Assets",
      templatesRoot: "Thư mục Templates"
    },
    saveConfig: "Lưu Cấu Hình",
    ready: "Sẵn sàng chế tác."
  },
  sidebar: {
    tabs: {
      matches: "Trận đấu",
      templates: "Templates"
    },
    filters: {
      ratio: "Tỷ lệ",
      template: "Template",
      allRatios: "Tất cả tỷ lệ"
    },
    matches: {
      header: "Các trận đấu trống",
      selectTemplateFirst: "Hãy chọn Template trước",
      noMatchesFound: "Không tìm thấy trận đấu nào phù hợp với bộ lọc."
    },
    templates: {
      importBtn: "Nhập JSON Template",
      noTemplates: "Không có template trong thư viện",
      useTemplate: "Sử dụng Template"
    }
  },
  workspace: {
    tabs: {
      untitled: "Graphic chưa đặt tên"
    },
    modals: {
      closeTab: {
        header: "Đóng Tab?",
        description: "Bạn có {changes} THAY ĐỔI CHƯA LƯU {/changes}. Đóng tab này sẽ xóa bỏ vĩnh viễn mọi chỉnh sửa của bạn.",
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
      header: "Phát hiện chỉnh sửa chưa lưu",
      description: "Bạn đã có chỉnh sửa thủ công trong phiên này. Thay đổi template sẽ {discard} HỦY BỎ {/discard} toàn bộ công sức của bạn.",
      openNewTab: "Mở trong Tab Mới",
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
      shadow: "Bóng đổ",
      typography: "Văn bản",
      background: "Nền",
      layers: "Các lớp"
    },
    fields: {
      sourceBindingPath: "Nguồn - Cấu trúc liên kết",
      source: "Nguồn",
      valueBindingPath: "Giá trị - Cấu trúc liên kết",
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
